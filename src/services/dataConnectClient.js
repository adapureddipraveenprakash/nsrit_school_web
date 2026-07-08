// Firebase Data Connect REST client — ported from the mobile app's dataConnectClient.js
// Only change: uses firebase/auth Web SDK instead of @react-native-firebase/auth,
// and localStorage instead of MMKV.

import { getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig, dataConnectConfig } from './firebase';
import { STORAGE_KEYS, storage, getJSON } from './storage';

const USER_ROLES = {
  MAIN_ADMIN: 'MAIN_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  COORDINATOR: 'COORDINATOR',
  TEACHER: 'TEACHER',
  CLASS_TEACHER: 'CLASS_TEACHER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
};

const buildConnectorName = () =>
  `projects/${dataConnectConfig.projectId}/locations/${dataConnectConfig.location}/services/${dataConnectConfig.serviceId}/connectors/${dataConnectConfig.connectorId}`;

const AUTH_STATE_WAIT_MS = 3000;

const waitForCurrentUser = (authInstance) => {
  if (authInstance.currentUser) return Promise.resolve(authInstance.currentUser);
  return new Promise((resolve) => {
    let timeoutId;
    let settled = false;
    let unsubscribe = () => {};
    const finish = (user) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(user || authInstance.currentUser || null);
    };
    unsubscribe = onAuthStateChanged(authInstance, finish);
    timeoutId = setTimeout(() => finish(authInstance.currentUser || null), AUTH_STATE_WAIT_MS);
  });
};

const getAuthToken = async () => {
  const authInstance = getAuth();
  const currentUser = await waitForCurrentUser(authInstance);
  if (!currentUser) {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
    return null;
  }
  const token = await getIdToken(currentUser);
  storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  return token;
};

// UUID normalisation — Data Connect REST API returns bare 32-char hex UUIDs;
// Postgres stores them with hyphens. Always normalise to hyphenated form.
const UUID_BARE_RE = /^[0-9a-f]{32}$/i;
const toHyphenatedUuid = (str) =>
  `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;

const normalizeUuids = (value) => {
  if (typeof value === 'string') return UUID_BARE_RE.test(value) ? toHyphenatedUuid(value) : value;
  if (Array.isArray(value)) return value.map(normalizeUuids);
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value)) result[key] = normalizeUuids(value[key]);
    return result;
  }
  return value;
};

const AUDIT_OPERATION = 'RecordAuditLog';

const ACTING_AS_BY_MUTATION = {
  CreateBranch: USER_ROLES.MAIN_ADMIN, UpdateBranch: USER_ROLES.MAIN_ADMIN,
  AssignBranchAdmin: USER_ROLES.MAIN_ADMIN, AssignPrincipal: USER_ROLES.MAIN_ADMIN,
  CreateCoordinator: USER_ROLES.PRINCIPAL, UpdateCoordinator: USER_ROLES.PRINCIPAL,
  CreateTeacher: USER_ROLES.PRINCIPAL, UpdateTeacher: USER_ROLES.PRINCIPAL,
  CreateAccountant: USER_ROLES.PRINCIPAL, UpdateAccountant: USER_ROLES.PRINCIPAL,
  CreateSection: USER_ROLES.PRINCIPAL, UpdateSection: USER_ROLES.PRINCIPAL,
  RemoveSection: USER_ROLES.PRINCIPAL,
  CreateStudent: USER_ROLES.COORDINATOR, UpdateStudent: USER_ROLES.COORDINATOR,
  TransferStudent: USER_ROLES.COORDINATOR, BulkAssignStudents: USER_ROLES.COORDINATOR,
  UpdateStudentStatus: USER_ROLES.COORDINATOR,
  CreateAttendance: USER_ROLES.TEACHER, UpdateAttendance: USER_ROLES.TEACHER,
  CreateFeeCategory: USER_ROLES.ACCOUNTANT, UpdateFeeCategory: USER_ROLES.ACCOUNTANT,
  CreateFeePlan: USER_ROLES.ACCOUNTANT, UpdateFeePlan: USER_ROLES.ACCOUNTANT,
  RecordPayment: USER_ROLES.ACCOUNTANT, UpdatePayment: USER_ROLES.ACCOUNTANT, ReversePayment: USER_ROLES.ACCOUNTANT,
};

const entityTypeForMutation = (operationName) =>
  String(operationName || '')
    .replace(/^(Create|Update|Assign|Remove|Record|Reverse|Activate|Deactivate|Transfer|Bulk)/, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();

const extractEntityId = (data) => {
  const values = Object.values(data || {});
  const direct = values.find((v) => typeof v === 'string');
  if (direct) return direct;
  const withId = values.find((v) => v && typeof v === 'object' && v.id);
  return withId?.id ? String(withId.id) : null;
};

const compactJSON = (value) => {
  if (!value) return null;
  const s = JSON.stringify(value);
  return s.length > 6000 ? `${s.slice(0, 6000)}...` : s;
};

const maybeRecordMainAdminAudit = async ({ operationName, variables, data, token }) => {
  if (operationName === AUDIT_OPERATION) return;
  const user = getJSON(STORAGE_KEYS.AUTH_USER);
  if (String(user?.role || '').toUpperCase() !== USER_ROLES.MAIN_ADMIN) return;
  const context = getJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT);
  const branchId = variables?.branchId || context?.branchId || user?.branchId || null;
  const actingAs = ACTING_AS_BY_MUTATION[operationName] || USER_ROLES.MAIN_ADMIN;
  await executeConnectorOperation({
    operationName: AUDIT_OPERATION, type: 'mutation',
    variables: {
      performedBy: user?.fullName || user?.name || USER_ROLES.MAIN_ADMIN,
      performedRole: USER_ROLES.MAIN_ADMIN, actingAs, branchId,
      action: operationName, entityType: entityTypeForMutation(operationName),
      entityId: extractEntityId(data) || variables?.id || variables?.studentId || null,
      oldData: null, newData: compactJSON(variables),
    },
    tokenOverride: token, skipAudit: true,
  });
};
let cachedFallbackBranchId = null;

const getFallbackBranchId = async () => {
  if (cachedFallbackBranchId) return cachedFallbackBranchId;
  
  try {
    const context = getJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT);
    if (context && context.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(context.id)) {
      cachedFallbackBranchId = context.id;
      return cachedFallbackBranchId;
    }
  } catch (e) {}

  try {
    const user = getJSON(STORAGE_KEYS.AUTH_USER);
    if (user && user.branchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.branchId)) {
      cachedFallbackBranchId = user.branchId;
      return cachedFallbackBranchId;
    }
  } catch (e) {}

  try {
    const apiKey = firebaseConfig.apiKey;
    const connectorName = buildConnectorName();
    const token = await getAuthToken();
    if (token) {
      const response = await fetch(
        `${dataConnectConfig.apiBaseURL}/${connectorName}:executeQuery?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Client': 'gl-js/web/nsrit-connect',
            'X-Firebase-Auth-Token': token,
          },
          body: JSON.stringify({
            name: connectorName,
            operationName: 'GetBranches',
            variables: { limit: 10 },
          }),
        }
      );
      const payload = await response.json();
      const branches = payload.data?.branches || [];
      const sontyam = branches.find(b => b.name === 'Sontyam') || branches[0];
      if (sontyam && sontyam.id) {
        cachedFallbackBranchId = sontyam.id;
        return cachedFallbackBranchId;
      }
    }
  } catch (err) {
    console.warn('[DataConnect] Failed to resolve fallback branch UUID:', err.message);
  }

  return null;
};

const executeConnectorOperation = async ({ operationName, variables = {}, type, tokenOverride, skipAudit = false }) => {
  let attempt = 0;
  const maxRetries = 3;
  const initialDelay = 500;

  while (true) {
    try {
      // If variables contain 'sontyam-branch-id', replace it dynamically with the actual branch UUID
      if (operationName !== 'GetBranches') {
        const fallbackId = await getFallbackBranchId();
        if (fallbackId) {
          for (const key of Object.keys(variables || {})) {
            if (variables[key] === 'sontyam-branch-id') {
              variables[key] = fallbackId;
            }
          }
        }
      }

      const invalidUuidEntry = Object.entries(variables || {}).find(([key, val]) => {
        if (typeof val === 'string' && (key.endsWith('Id') || key.toLowerCase().includes('uuid'))) {
          if (key === 'studentId' || key === 'employeeId') {
            return false;
          }
          if (val.includes('-placeholder') || val === 'sontyam-branch-id' || val === 'mock-plan-id' || val === 'mock-student-id') {
            return true;
          }
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
            return true;
          }
        }
        return false;
      });

      if (invalidUuidEntry) {
        const [failedKey, failedValue] = invalidUuidEntry;
        // If the value is 'sontyam-branch-id' and we haven't reached max retries, it's possible that
        // getFallbackBranchId failed due to transient network issues. Let's retry!
        if (failedValue === 'sontyam-branch-id' && attempt < maxRetries) {
          const err = new Error('sontyam-branch-id fallback could not be resolved due to network error');
          err.isTransient = true;
          throw err;
        }

        console.warn(`[DataConnect] Request for ${operationName} bypassed: invalid UUID in variables. Key: ${failedKey}, Value: ${failedValue}`, variables);
        if (type === 'mutation') {
          throw new Error(`Invalid UUID parameter passed to mutation ${operationName}: "${failedKey}" has invalid UUID value "${failedValue}"`);
        }
        return {};
      }

      const token = tokenOverride || (await getAuthToken());
      const apiKey = firebaseConfig.apiKey;
      const connectorName = buildConnectorName();
      const endpoint = type === 'mutation' ? 'executeMutation' : 'executeQuery';

      if (!token) throw new Error('Authentication required. Please sign in again.');

      const response = await fetch(
        `${dataConnectConfig.apiBaseURL}/${connectorName}:${endpoint}?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Client': 'gl-js/web/nsrit-connect',
            ...(token ? { 'X-Firebase-Auth-Token': token } : {}),
          },
          body: JSON.stringify({
            name: connectorName,
            operationName,
            variables: normalizeUuids(variables),
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok || payload.errors?.length || payload.error) {
        const status = response.status;
        const isTransientStatus =
          status === 0 ||
          status === 408 ||
          status === 429 ||
          status === 502 ||
          status === 503 ||
          status === 504;

        if (isTransientStatus && attempt < maxRetries) {
          const errMsg = payload.errors?.[0]?.message || payload.error?.message || `Status ${status}`;
          const err = new Error(errMsg);
          err.isTransient = true;
          throw err;
        }

        console.error('[DataConnect] Request failed:', { operationName, status: response.status, payload });
        const message = payload.errors?.[0]?.message || payload.error?.message || 'Data Connect request failed';
        throw new Error(message);
      }

      const data = normalizeUuids(payload.data || {});

      if (operationName !== 'MigrateReceiptNumber' && operationName !== 'RecordAuditLog') {
        autoMigrateLegacyReceipts(data);
      }

      if (!skipAudit && type === 'mutation') {
        await maybeRecordMainAdminAudit({ operationName, variables, data, token });
      }

      return data;
    } catch (error) {
      attempt++;
      
      const isNetworkError =
        error.isTransient ||
        error instanceof TypeError ||
        error.name === 'TypeError' ||
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('NETWORK_CHANGED') ||
        error.message?.includes('Failed to fetch');

      if (attempt > maxRetries || !isNetworkError) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 200;
      console.warn(
        `[DataConnect] Request for ${operationName} failed (${error.message || 'network error'}). ` +
        `Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const autoMigrateLegacyReceipts = (data) => {
  if (data === null || typeof data !== 'object') return;

  if (Array.isArray(data)) {
    data.forEach(autoMigrateLegacyReceipts);
    return;
  }

  // If it's a payment object (FeePayment returned from GQL)
  if (data.id && typeof data.receiptNumber === 'string' && data.receiptNumber.startsWith('REC-')) {
    const parts = data.receiptNumber.split('-');
    const lastPart = parts[parts.length - 1];
    const parsedSeq = Number(lastPart);
    if (!isNaN(parsedSeq) && parsedSeq > 0) {
      let branchCode = data.branchCode || 'SO';
      let year = data.receiptYear || new Date(data.paymentDate || new Date()).getFullYear();

      const formattedCode = String(branchCode).padStart(2, '0').slice(-2);
      const newReceiptNumber = `RCPT-${year}-${formattedCode}-${String(parsedSeq).padStart(5, '0')}`;

      // Trigger update
      executeConnectorOperation({
        operationName: 'MigrateReceiptNumber',
        type: 'mutation',
        variables: {
          paymentId: data.id,
          receiptNumber: newReceiptNumber
        },
        skipAudit: true
      })
        .then(() => console.log(`[Auto-Migration] Migrated payment ${data.id} receipt to ${newReceiptNumber}`))
        .catch(err => console.error('[Auto-Migration] Failed to migrate receipt number:', err));

      data.receiptNumber = newReceiptNumber;
    }
  }

  for (const key of Object.keys(data)) {
    if (data[key] && typeof data[key] === 'object') {
      autoMigrateLegacyReceipts(data[key]);
    }
  }
};

export const dataConnectClient = {
  async query(operationName, variables) {
    return executeConnectorOperation({ operationName, variables, type: 'query' });
  },
  async mutate(operationName, variables) {
    return executeConnectorOperation({ operationName, variables, type: 'mutation' });
  },
};

export default dataConnectClient;
