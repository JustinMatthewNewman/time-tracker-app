const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'ecs-time-tracker-app-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserFromGoogleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserFromGoogle', inputVars);
}
createUserFromGoogleRef.operationName = 'CreateUserFromGoogle';
exports.createUserFromGoogleRef = createUserFromGoogleRef;

exports.createUserFromGoogle = function createUserFromGoogle(dcOrVars, vars) {
  return executeMutation(createUserFromGoogleRef(dcOrVars, vars));
};

const createTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTimeEntry', inputVars);
}
createTimeEntryRef.operationName = 'CreateTimeEntry';
exports.createTimeEntryRef = createTimeEntryRef;

exports.createTimeEntry = function createTimeEntry(dcOrVars, vars) {
  return executeMutation(createTimeEntryRef(dcOrVars, vars));
};

const updateTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTimeEntry', inputVars);
}
updateTimeEntryRef.operationName = 'UpdateTimeEntry';
exports.updateTimeEntryRef = updateTimeEntryRef;

exports.updateTimeEntry = function updateTimeEntry(dcOrVars, vars) {
  return executeMutation(updateTimeEntryRef(dcOrVars, vars));
};

const deleteTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTimeEntry', inputVars);
}
deleteTimeEntryRef.operationName = 'DeleteTimeEntry';
exports.deleteTimeEntryRef = deleteTimeEntryRef;

exports.deleteTimeEntry = function deleteTimeEntry(dcOrVars, vars) {
  return executeMutation(deleteTimeEntryRef(dcOrVars, vars));
};

const createWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWorkLog', inputVars);
}
createWorkLogRef.operationName = 'CreateWorkLog';
exports.createWorkLogRef = createWorkLogRef;

exports.createWorkLog = function createWorkLog(dcOrVars, vars) {
  return executeMutation(createWorkLogRef(dcOrVars, vars));
};

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dc) {
  return executeQuery(listUsersRef(dc));
};

const listTimeEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntries', inputVars);
}
listTimeEntriesRef.operationName = 'ListTimeEntries';
exports.listTimeEntriesRef = listTimeEntriesRef;

exports.listTimeEntries = function listTimeEntries(dcOrVars, vars) {
  return executeQuery(listTimeEntriesRef(dcOrVars, vars));
};

const getTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimeEntry', inputVars);
}
getTimeEntryRef.operationName = 'GetTimeEntry';
exports.getTimeEntryRef = getTimeEntryRef;

exports.getTimeEntry = function getTimeEntry(dcOrVars, vars) {
  return executeQuery(getTimeEntryRef(dcOrVars, vars));
};

const listTimeEntriesByDateRangeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntriesByDateRange', inputVars);
}
listTimeEntriesByDateRangeRef.operationName = 'ListTimeEntriesByDateRange';
exports.listTimeEntriesByDateRangeRef = listTimeEntriesByDateRangeRef;

exports.listTimeEntriesByDateRange = function listTimeEntriesByDateRange(dcOrVars, vars) {
  return executeQuery(listTimeEntriesByDateRangeRef(dcOrVars, vars));
};
