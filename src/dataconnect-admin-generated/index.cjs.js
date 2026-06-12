const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'ecs-time-tracker-app-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function createUserFromGoogle(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateUserFromGoogle', inputVars, inputOpts);
}
exports.createUserFromGoogle = createUserFromGoogle;

function listUsers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListUsers', undefined, inputOpts);
}
exports.listUsers = listUsers;

