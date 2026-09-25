// Dev-only failure switches (POST /rfin/dev/scenario). In memory: resets when
// the server restarts, and never reachable in production.
const state = { failPayments: false };

module.exports = {
  get: () => ({ ...state }),
  set: (patch) => Object.assign(state, patch),
};
