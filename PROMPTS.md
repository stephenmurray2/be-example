## A list of prompts used for Claude Code, along with comments

```console
Please setup the application according to the contents of SPEC-A-architecture.md
```
I aborted the installation of serverless-plugin-typescript since it could not be resolved.

```console
Please continue the setup according to the contents of SPEC-B-api.md
```
In both of these first two steps, Claude executed many generic "escape hatch" fixes to resolve the TypeScript build issues (eg. casting as `any`) and these should be properly resolved. Some additional code changes were required to ensure that the application didn't attempt to connect to a database when running in "memory" mode.

```console
Within the tests folder, define jest framework tests for SalesforceCartClient
```
These are strictly unit tests, therefore any dependency is mocked.

```console
In addition to these unit tests, add tests which, instead of mocking calls to the api, make calls to a real api instance (which use the InMemoryStorage as the
 store)
```

```console
Add an integration test which tests that the appropriate error occurs if the request times out
```

```console
Within the Salesforce service, add simple "add to cart" and "remove from cart" functionalities, along with the supporting changes in models. Also add appropriate changes to the SDK, along with unit/integration tests.
```