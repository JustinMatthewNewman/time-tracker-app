const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'ecs-time-tracker-app-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const createUserFromGoogleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserFromGoogle', inputVars);
}
createUserFromGoogleRef.operationName = 'CreateUserFromGoogle';
exports.createUserFromGoogleRef = createUserFromGoogleRef;

exports.createUserFromGoogle = function createUserFromGoogle(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserFromGoogleRef(dcInstance, inputVars));
}
;

const setUserTypeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetUserType', inputVars);
}
setUserTypeRef.operationName = 'SetUserType';
exports.setUserTypeRef = setUserTypeRef;

exports.setUserType = function setUserType(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setUserTypeRef(dcInstance, inputVars));
}
;

const createTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTimeEntry', inputVars);
}
createTimeEntryRef.operationName = 'CreateTimeEntry';
exports.createTimeEntryRef = createTimeEntryRef;

exports.createTimeEntry = function createTimeEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createTimeEntryRef(dcInstance, inputVars));
}
;

const createWorkLogOnlyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWorkLogOnly', inputVars);
}
createWorkLogOnlyRef.operationName = 'CreateWorkLogOnly';
exports.createWorkLogOnlyRef = createWorkLogOnlyRef;

exports.createWorkLogOnly = function createWorkLogOnly(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createWorkLogOnlyRef(dcInstance, inputVars));
}
;

const updateTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTimeEntry', inputVars);
}
updateTimeEntryRef.operationName = 'UpdateTimeEntry';
exports.updateTimeEntryRef = updateTimeEntryRef;

exports.updateTimeEntry = function updateTimeEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTimeEntryRef(dcInstance, inputVars));
}
;

const updateTimeEntryClearTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTimeEntryClearTicket', inputVars);
}
updateTimeEntryClearTicketRef.operationName = 'UpdateTimeEntryClearTicket';
exports.updateTimeEntryClearTicketRef = updateTimeEntryClearTicketRef;

exports.updateTimeEntryClearTicket = function updateTimeEntryClearTicket(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTimeEntryClearTicketRef(dcInstance, inputVars));
}
;

const deleteTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTimeEntry', inputVars);
}
deleteTimeEntryRef.operationName = 'DeleteTimeEntry';
exports.deleteTimeEntryRef = deleteTimeEntryRef;

exports.deleteTimeEntry = function deleteTimeEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteTimeEntryRef(dcInstance, inputVars));
}
;

const upsertTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertTicket', inputVars);
}
upsertTicketRef.operationName = 'UpsertTicket';
exports.upsertTicketRef = upsertTicketRef;

exports.upsertTicket = function upsertTicket(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertTicketRef(dcInstance, inputVars));
}
;

const updateTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTicket', inputVars);
}
updateTicketRef.operationName = 'UpdateTicket';
exports.updateTicketRef = updateTicketRef;

exports.updateTicket = function updateTicket(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTicketRef(dcInstance, inputVars));
}
;

const selectMyColorSchemeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyColorScheme', inputVars);
}
selectMyColorSchemeRef.operationName = 'SelectMyColorScheme';
exports.selectMyColorSchemeRef = selectMyColorSchemeRef;

exports.selectMyColorScheme = function selectMyColorScheme(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyColorSchemeRef(dcInstance, inputVars));
}
;

const clearMyColorSchemeRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClearMyColorScheme');
}
clearMyColorSchemeRef.operationName = 'ClearMyColorScheme';
exports.clearMyColorSchemeRef = clearMyColorSchemeRef;

exports.clearMyColorScheme = function clearMyColorScheme(dc) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dc, undefined);
  return executeMutation(clearMyColorSchemeRef(dcInstance, inputVars));
}
;

const selectMyPerformanceModeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyPerformanceMode', inputVars);
}
selectMyPerformanceModeRef.operationName = 'SelectMyPerformanceMode';
exports.selectMyPerformanceModeRef = selectMyPerformanceModeRef;

exports.selectMyPerformanceMode = function selectMyPerformanceMode(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyPerformanceModeRef(dcInstance, inputVars));
}
;

const selectMyBackgroundOpacityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyBackgroundOpacity', inputVars);
}
selectMyBackgroundOpacityRef.operationName = 'SelectMyBackgroundOpacity';
exports.selectMyBackgroundOpacityRef = selectMyBackgroundOpacityRef;

exports.selectMyBackgroundOpacity = function selectMyBackgroundOpacity(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyBackgroundOpacityRef(dcInstance, inputVars));
}
;

const selectMyExternalTicketLinkTemplateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyExternalTicketLinkTemplate', inputVars);
}
selectMyExternalTicketLinkTemplateRef.operationName = 'SelectMyExternalTicketLinkTemplate';
exports.selectMyExternalTicketLinkTemplateRef = selectMyExternalTicketLinkTemplateRef;

exports.selectMyExternalTicketLinkTemplate = function selectMyExternalTicketLinkTemplate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars);
  return executeMutation(selectMyExternalTicketLinkTemplateRef(dcInstance, inputVars));
}
;

const selectMyCardStyleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyCardStyle', inputVars);
}
selectMyCardStyleRef.operationName = 'SelectMyCardStyle';
exports.selectMyCardStyleRef = selectMyCardStyleRef;

exports.selectMyCardStyle = function selectMyCardStyle(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyCardStyleRef(dcInstance, inputVars));
}
;

const selectMyBordersEnabledRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyBordersEnabled', inputVars);
}
selectMyBordersEnabledRef.operationName = 'SelectMyBordersEnabled';
exports.selectMyBordersEnabledRef = selectMyBordersEnabledRef;

exports.selectMyBordersEnabled = function selectMyBordersEnabled(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyBordersEnabledRef(dcInstance, inputVars));
}
;

const selectMyTicketColorsEnabledRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SelectMyTicketColorsEnabled', inputVars);
}
selectMyTicketColorsEnabledRef.operationName = 'SelectMyTicketColorsEnabled';
exports.selectMyTicketColorsEnabledRef = selectMyTicketColorsEnabledRef;

exports.selectMyTicketColorsEnabled = function selectMyTicketColorsEnabled(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(selectMyTicketColorsEnabledRef(dcInstance, inputVars));
}
;

const updateWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateWorkLog', inputVars);
}
updateWorkLogRef.operationName = 'UpdateWorkLog';
exports.updateWorkLogRef = updateWorkLogRef;

exports.updateWorkLog = function updateWorkLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateWorkLogRef(dcInstance, inputVars));
}
;

const deleteWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteWorkLog', inputVars);
}
deleteWorkLogRef.operationName = 'DeleteWorkLog';
exports.deleteWorkLogRef = deleteWorkLogRef;

exports.deleteWorkLog = function deleteWorkLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteWorkLogRef(dcInstance, inputVars));
}
;

const restoreWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RestoreWorkLog', inputVars);
}
restoreWorkLogRef.operationName = 'RestoreWorkLog';
exports.restoreWorkLogRef = restoreWorkLogRef;

exports.restoreWorkLog = function restoreWorkLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(restoreWorkLogRef(dcInstance, inputVars));
}
;

const createWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateWorkLog', inputVars);
}
createWorkLogRef.operationName = 'CreateWorkLog';
exports.createWorkLogRef = createWorkLogRef;

exports.createWorkLog = function createWorkLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createWorkLogRef(dcInstance, inputVars));
}
;

const upsertGoogleCalendarConnectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertGoogleCalendarConnection', inputVars);
}
upsertGoogleCalendarConnectionRef.operationName = 'UpsertGoogleCalendarConnection';
exports.upsertGoogleCalendarConnectionRef = upsertGoogleCalendarConnectionRef;

exports.upsertGoogleCalendarConnection = function upsertGoogleCalendarConnection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertGoogleCalendarConnectionRef(dcInstance, inputVars));
}
;

const updateGoogleCalendarSyncPrefsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateGoogleCalendarSyncPrefs', inputVars);
}
updateGoogleCalendarSyncPrefsRef.operationName = 'UpdateGoogleCalendarSyncPrefs';
exports.updateGoogleCalendarSyncPrefsRef = updateGoogleCalendarSyncPrefsRef;

exports.updateGoogleCalendarSyncPrefs = function updateGoogleCalendarSyncPrefs(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateGoogleCalendarSyncPrefsRef(dcInstance, inputVars));
}
;

const touchGoogleCalendarLastSyncedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TouchGoogleCalendarLastSynced', inputVars);
}
touchGoogleCalendarLastSyncedRef.operationName = 'TouchGoogleCalendarLastSynced';
exports.touchGoogleCalendarLastSyncedRef = touchGoogleCalendarLastSyncedRef;

exports.touchGoogleCalendarLastSynced = function touchGoogleCalendarLastSynced(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(touchGoogleCalendarLastSyncedRef(dcInstance, inputVars));
}
;

const deleteGoogleCalendarConnectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteGoogleCalendarConnection', inputVars);
}
deleteGoogleCalendarConnectionRef.operationName = 'DeleteGoogleCalendarConnection';
exports.deleteGoogleCalendarConnectionRef = deleteGoogleCalendarConnectionRef;

exports.deleteGoogleCalendarConnection = function deleteGoogleCalendarConnection(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteGoogleCalendarConnectionRef(dcInstance, inputVars));
}
;

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUsersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getMyUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyUser');
}
getMyUserRef.operationName = 'GetMyUser';
exports.getMyUserRef = getMyUserRef;

exports.getMyUser = function getMyUser(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listColorSchemesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListColorSchemes');
}
listColorSchemesRef.operationName = 'ListColorSchemes';
exports.listColorSchemesRef = listColorSchemesRef;

exports.listColorSchemes = function listColorSchemes(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listColorSchemesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listTicketsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTickets', inputVars);
}
listTicketsRef.operationName = 'ListTickets';
exports.listTicketsRef = listTicketsRef;

exports.listTickets = function listTickets(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listTicketsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listTimeEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntries', inputVars);
}
listTimeEntriesRef.operationName = 'ListTimeEntries';
exports.listTimeEntriesRef = listTimeEntriesRef;

exports.listTimeEntries = function listTimeEntries(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listTimeEntriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getTimeEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTimeEntry', inputVars);
}
getTimeEntryRef.operationName = 'GetTimeEntry';
exports.getTimeEntryRef = getTimeEntryRef;

exports.getTimeEntry = function getTimeEntry(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTimeEntryRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listWorkLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListWorkLogs', inputVars);
}
listWorkLogsRef.operationName = 'ListWorkLogs';
exports.listWorkLogsRef = listWorkLogsRef;

exports.listWorkLogs = function listWorkLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listWorkLogsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listTimeEntriesByWorkLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntriesByWorkLog', inputVars);
}
listTimeEntriesByWorkLogRef.operationName = 'ListTimeEntriesByWorkLog';
exports.listTimeEntriesByWorkLogRef = listTimeEntriesByWorkLogRef;

exports.listTimeEntriesByWorkLog = function listTimeEntriesByWorkLog(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listTimeEntriesByWorkLogRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listTimeEntriesByTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntriesByTicket', inputVars);
}
listTimeEntriesByTicketRef.operationName = 'ListTimeEntriesByTicket';
exports.listTimeEntriesByTicketRef = listTimeEntriesByTicketRef;

exports.listTimeEntriesByTicket = function listTimeEntriesByTicket(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listTimeEntriesByTicketRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyTimeEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyTimeEntries', inputVars);
}
listMyTimeEntriesRef.operationName = 'ListMyTimeEntries';
exports.listMyTimeEntriesRef = listMyTimeEntriesRef;

exports.listMyTimeEntries = function listMyTimeEntries(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listMyTimeEntriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listTimeEntriesByDateRangeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTimeEntriesByDateRange', inputVars);
}
listTimeEntriesByDateRangeRef.operationName = 'ListTimeEntriesByDateRange';
exports.listTimeEntriesByDateRangeRef = listTimeEntriesByDateRangeRef;

exports.listTimeEntriesByDateRange = function listTimeEntriesByDateRange(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listTimeEntriesByDateRangeRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listUserTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserTypes');
}
listUserTypesRef.operationName = 'ListUserTypes';
exports.listUserTypesRef = listUserTypesRef;

exports.listUserTypes = function listUserTypes(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUserTypesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getUserAccessByGoogleUidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserAccessByGoogleUid', inputVars);
}
getUserAccessByGoogleUidRef.operationName = 'GetUserAccessByGoogleUid';
exports.getUserAccessByGoogleUidRef = getUserAccessByGoogleUidRef;

exports.getUserAccessByGoogleUid = function getUserAccessByGoogleUid(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getUserAccessByGoogleUidRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const adminListUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdminListUsers');
}
adminListUsersRef.operationName = 'AdminListUsers';
exports.adminListUsersRef = adminListUsersRef;

exports.adminListUsers = function adminListUsers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(adminListUsersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const adminListUserTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdminListUserTypes');
}
adminListUserTypesRef.operationName = 'AdminListUserTypes';
exports.adminListUserTypesRef = adminListUserTypesRef;

exports.adminListUserTypes = function adminListUserTypes(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(adminListUserTypesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const adminListFeaturesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdminListFeatures');
}
adminListFeaturesRef.operationName = 'AdminListFeatures';
exports.adminListFeaturesRef = adminListFeaturesRef;

exports.adminListFeatures = function adminListFeatures(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(adminListFeaturesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const adminGetUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdminGetUser', inputVars);
}
adminGetUserRef.operationName = 'AdminGetUser';
exports.adminGetUserRef = adminGetUserRef;

exports.adminGetUser = function adminGetUser(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(adminGetUserRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const adminListTeamsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AdminListTeams');
}
adminListTeamsRef.operationName = 'AdminListTeams';
exports.adminListTeamsRef = adminListTeamsRef;

exports.adminListTeams = function adminListTeams(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(adminListTeamsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const getGoogleCalendarConnectionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGoogleCalendarConnection', inputVars);
}
getGoogleCalendarConnectionRef.operationName = 'GetGoogleCalendarConnection';
exports.getGoogleCalendarConnectionRef = getGoogleCalendarConnectionRef;

exports.getGoogleCalendarConnection = function getGoogleCalendarConnection(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getGoogleCalendarConnectionRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
