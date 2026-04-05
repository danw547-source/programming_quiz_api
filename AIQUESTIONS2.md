# Project Workflow: From Start to Finish

## 1. What was your initial approach to understanding the challenge?
**Answer:**  
I started by reading the brief carefully to identify the core requirements: supporting multiple languages, currencies, and per-country visibility for products, plus extending to digital products and conditions. This helped me break down the problem into manageable parts—language, currency, and visibility—before diving into code.

## 2. How did you set up the basic project structure?
**Answer:**  
I created a new directory for the project and initialized Composer with `composer init` to set up autoloading. I used PSR-4 autoloading to map the `App\` namespace to the root directory, which keeps classes organized and easy to load without manual `require` statements.

## 3. What was the first code you wrote?
**Answer:**  
I began with the `Product` model class, defining its properties (SKU, names array for translations, price in GBP, visibility countries, etc.) and basic methods. This established the core data structure early, making it easier to build other layers around it.

## 4. How did you handle the multi-language requirement?
**Answer:**  
In the `Product` class, I added a `names` array for translations and a `getName($language)` method with fallbacks (requested language → English → SKU). This simple approach allowed quick addition of languages without complex multi-language libraries.

## 5. What about currency conversion—how did you implement that?
**Answer:**  
I stored base prices in GBP in the model, then added exchange rates as a constant array in `InventoryService`. The service handles conversion during inventory retrieval, rounding to 2 decimal places. This kept currency logic centralized and easy to update.

## 6. How did you add country visibility filtering?
**Answer:**  
Each `Product` got a `visibleInCountries` array, and I added `isVisibleIn($country)` with case-insensitive checks. The service filters products during `getInventory()`, skipping those not visible in the requested country.

## 7. When did you introduce the layered architecture?
**Answer:**  
After the basic model, I created the `InventoryInterface` to define contracts, then built the `InMemoryProductRepository` for data access, `InventoryService` for business logic, `InventoryController` for request handling, and `InventoryPresenter` for output formatting. This separation came early to ensure clean, testable code.

## 8. How did you implement Part 2 (digital products and conditions)?
**Answer:**  
I added the `Condition` enum for new/used/refurbished states, then created `DigitalProduct` extending `Product` with overrides for visibility (always true), availability (always true), and physical properties (zero weight/volume, instant delivery). This reused existing code while adding new behavior.

## 9. What sample data did you create, and why?
**Answer:**  
I hardcoded a few products in `InMemoryProductRepository`—physical ones with different conditions and countries, plus digital ones. This provided realistic test data without needing a database, allowing quick validation of filtering, translations, and conversions.

## 10. How did you wire everything together?
**Answer:**  
In `demo.php`, I instantiated dependencies manually (repository → service → presenter → controller) and called the `index()` method with different parameters. This demonstrated the full flow and ensured all layers worked together.

## 11. What testing did you do during development?
**Answer:**  
I ran `demo.php` repeatedly after each major change, checking the JSON output for correct filtering, translations, and prices. This manual testing caught issues early and validated that the system met the requirements.

## 12. How did you handle edge cases or refinements?
**Answer:**  
I added fallbacks for missing translations, normalized currency inputs, and ensured digital products always show as "new" condition. I also made country checks case-insensitive to handle user input variations.

## 13. What documentation did you create?
**Answer:**  
I wrote `approach.md` to explain my thought process, updated the README with setup instructions, and created `Questions.md` for interview prep. This made the project easier to understand and review.

## 14. If you had more time, what would you improve?
**Answer:**  
I'd add unit tests with PHPUnit, integrate a real database, implement input validation and error handling, and perhaps add caching for performance. These would make it production-ready.

## 15. How does this workflow demonstrate your development process?
**Answer:**  
It shows a structured approach: understand requirements, set up basics, implement core features iteratively, test frequently, and document clearly. This ensures quality and scalability, even in a time-limited challenge.

# AIQuiz Questions (auto-parsed)

- prompt: What was your initial approach to understanding the challenge?
  answer: Read the brief thoroughly and break the problem into features (multi-language support, currency, visibility, product types), then design a plan before coding.
  explanation: This creates focus and avoids early rewrites by ensuring requirements are clear first.

- prompt: How did you set up the basic project structure?
  answer: Used Composer, PSR-4 autoloading, and a directory layout for model/service/controller/presenter layers.
  explanation: A consistent structure makes the project easy to extend and maintain.

- prompt: What was the first code you wrote?
  answer: The Product model with core properties and methods, since it is the foundation for everything else.
  explanation: Starting with the domain model helps make subsequent layers consistent.

- prompt: How did you handle the multi-language requirement?
  answer: Added a names array and getName(language) with fallbacks from requested language to English to SKU.
  explanation: This ensures robust localization without needing heavy tools.

- prompt: What about currency conversion—how did you implement that?
  answer: Keep base prices in GBP, convert in InventoryService using a rate table, and round to 2 decimal places.
  explanation: Centralizing conversion logic keeps pricing behavior predictable.

- prompt: How did you add country visibility filtering?
  answer: Each product has visibleInCountries; service filters with case-normalized country codes.
  explanation: This avoids showing region-restricted items to users in other countries.

- prompt: When did you introduce the layered architecture?
  answer: Early, with interfaces, repository, service, controller, and presenter layers.
  explanation: It makes the system testable and separable.

- prompt: How did you implement Part 2 (digital products and conditions)?
  answer: Added a Condition enum and DigitalProduct subclass that overrides availability/weight/volume rules.
  explanation: This keeps behavior clear while reusing shared code.

- prompt: What sample data did you create, and why?
  answer: Hardcoded products in repository for quick iterations without a database.
  explanation: It allows fast manual verification of key behaviors.

- prompt: How did you wire everything together?
  answer: demo.php builds dependencies and runs controller actions to exercise end-to-end flow.
  explanation: This integration check proves all layers interact correctly.

- prompt: What testing did you do during development?
  answer: Ran demo app frequently, verifying JSON for filtering, translation, and pricing.
  explanation: Frequent checks catch issues early and confirm incremental progress.

- prompt: How did you handle edge cases or refinements?
  answer: Added translation fallback, normalized inputs, and enforced digital product behavior.
  explanation: This improves robustness for real user inputs.

- prompt: What documentation did you create?
  answer: approach.md, README additions, and Questions.md for review context.
  explanation: Good docs reduce onboarding friction and make the project easier to evaluate.

- prompt: If you had more time, what would you improve?
  answer: Add unit tests, database support, validation, error handling, and caching.
  explanation: These are standard production hardening steps.

- prompt: How does this workflow demonstrate your development process?
  answer: It shows requirement gathering, architecture design, incremental implement/test cycles, and documentation.
  explanation: This approach yields consistent progress and mitigates risk.

- prompt: If DigitalProduct did not follow InventoryInterface, what service code becomes harder to write?
  question_set: g4m 2
  answer: The part of getInventory that treats all products uniformly through interface methods becomes harder to write.
  explanation: Without a shared contract, service logic must branch per product type.

- prompt: Which interface methods are behavior versus plain data access?
  question_set: g4m 2
  answer: Behavior methods are getPrice and isVisibleIn; plain data access methods are getName and getCondition.
  explanation: Behavior methods compute or decide; data methods fetch stored state.

- prompt: Why is using Condition::Used safer than repeating the string used everywhere?
  question_set: g4m 2
  answer: It prevents typos, improves IDE autocomplete, and catches mistakes earlier.
  explanation: Enum values constrain inputs to valid, known states.

- prompt: What bug appears when condition is free text instead of enum-based?
  question_set: g4m 2
  answer: Inconsistent spellings and typos like used, Used, or usedd can silently break logic.
  explanation: Free text allows invalid variants that pass unnoticed.

- prompt: Why does getName use requested language then English then SKU fallback?
  question_set: g4m 2
  answer: It guarantees a usable name even when translation data is incomplete.
  explanation: Fallback order prevents empty display values.

- prompt: Why does isVisibleIn uppercase country codes before comparing?
  question_set: g4m 2
  answer: To make checks case-insensitive so gb and GB match consistently.
  explanation: Normalization removes user input casing differences.

- prompt: Why does getPrice return GBP despite accepting a currency argument?
  question_set: g4m 2
  answer: In this implementation, the currency argument is intentionally ignored and GBP is returned.
  explanation: Currency conversion is handled elsewhere in service logic.

- prompt: In DigitalProduct, what is inherited versus overridden from Product?
  question_set: g4m 2
  answer: getName, getPrice, and isVisibleIn are inherited; getCondition, getWeight, getBoxVolume, and daysToDeliver are overridden.
  explanation: Shared behavior is reused while physical-specific behavior is specialized.

- prompt: Why are weight, boxVolume, and daysToDeliver zero for digital products?
  question_set: g4m 2
  answer: Digital products do not have physical shipping properties.
  explanation: Zero values encode non-physical characteristics clearly.

- prompt: Why is digital product condition always new?
  question_set: g4m 2
  answer: Digital products do not physically wear down, so they remain new.
  explanation: Condition maps to physical state, which digital items lack.

- prompt: Why keep product data in a repository instead of directly in service?
  question_set: g4m 2
  answer: To separate data access from business logic and allow future storage swaps.
  explanation: This keeps service code stable when persistence changes.

- prompt: Which sample product proves country filtering works?
  question_set: g4m 2
  answer: USB Cable visible only in GB proves country-specific filtering works.
  explanation: A restricted product demonstrates the filter excluding non-matching regions.

- prompt: Which sample product proves digital behavior works?
  question_set: g4m 2
  answer: The eBook, because it has zero weight and always-new condition.
  explanation: Those values demonstrate digital-specific overrides.

- prompt: What business rules does getInventory implement exactly?
  question_set: g4m 2
  answer: It filters by country, resolves currency, rounds prices, and returns only visible products.
  explanation: The method combines visibility and output-value normalization rules.

- prompt: Why is rounding done in service and not presenter?
  question_set: g4m 2
  answer: Rounding is business logic, while presenter should only handle output formatting.
  explanation: Separation of concerns keeps formatting and rules distinct.

- prompt: What issue does resolveCurrency prevent for invalid user input?
  question_set: g4m 2
  answer: It prevents invalid currency codes from being echoed into output responses.
  explanation: Invalid inputs are normalized to supported values before response generation.

- prompt: Why is this controller described as thin?
  question_set: g4m 2
  answer: It contains minimal orchestration code and delegates logic to service and repository layers.
  explanation: Thin controllers avoid business-rule bloat.

- prompt: What is a warning sign too much logic moved into controller?
  question_set: g4m 2
  answer: The controller grows long and starts containing business rules that belong in service.
  explanation: This signals broken layer boundaries.

- prompt: Why separate output formatting from service logic?
  question_set: g4m 2
  answer: So the same service can be reused for JSON, XML, CSV, or other formats without changes.
  explanation: Formatting concerns should stay in presenter/output layer.

- prompt: What does JSON_UNESCAPED_UNICODE improve in this dataset?
  question_set: g4m 2
  answer: It keeps special characters like euro, pound, and accented letters readable instead of escaped.
  explanation: This improves human readability and output fidelity.

- prompt: Describe the dependency chain from repository to final JSON output.
  question_set: g4m 2
  answer: Repository to Service to Controller to Presenter to JSON output.
  explanation: Data retrieval, business rules, orchestration, and formatting happen in that order.

- prompt: Why are GB/GBP and FR/EUR demo examples useful together?
  question_set: g4m 2
  answer: They quickly exercise multiple paths for filtering, currency handling, and visibility.
  explanation: Two contrasting scenarios provide fast high-value validation.

- prompt: If adding CAD currency, what files should change and why?
  question_set: g4m 2
  answer: Update Service.php for CAD support and demo.php to add a CAD test case.
  explanation: Service defines currency behavior; demo verifies it end-to-end.

- prompt: If switching from in-memory data to MySQL, which layer should change?
  question_set: g4m 2
  answer: Only repository should change, while service, controller, and presenter can stay unchanged.
  explanation: Repository abstraction isolates persistence concerns.

- prompt: What makes adding a third product type easier in this design?
  question_set: g4m 2
  answer: InventoryInterface lets service work with any product type that implements the interface.
  explanation: Interface-driven design supports extension without rewriting core service logic.

- prompt: Where should authentication happen first in this architecture?
  question_set: g4mextended
  answer: Authentication should happen at the request boundary in controller or middleware before service logic runs.
  explanation: Early authentication blocks unauthorized requests before deeper layers execute.

- prompt: If using JWT, what should the controller do with token claims before calling the service?
  question_set: g4mextended
  answer: Validate token signature and expiry, then pass only trusted identity and role context to the service.
  explanation: Services should receive trusted context, not raw unverified token payloads.

- prompt: What user-specific data should reach the service and why?
  question_set: g4mextended
  answer: Only minimal validated context like user ID, roles, and tenant when required should reach the service.
  explanation: Minimal trusted context reduces coupling and lowers security risk.

- prompt: How would role-based access be enforced without polluting model classes?
  question_set: g4mextended
  answer: Enforce roles using authorization policies or guards at controller or service boundaries.
  explanation: Authorization belongs in application policy layers, not domain data classes.

- prompt: What parts of authentication should be unit tested versus integration tested?
  question_set: g4mextended
  answer: Unit test token parsing and policy logic, and integration test end-to-end request authentication flow.
  explanation: This combines isolated correctness checks with wiring and contract verification.

- prompt: Which validation belongs at controller boundary versus service rules?
  question_set: g4mextended
  answer: Controller validates shape and required fields, while service enforces business constraints.
  explanation: Boundary validation protects interface contracts; service validation protects domain rules.

- prompt: How would you structure validation errors so presenter output stays consistent?
  question_set: g4mextended
  answer: Use a standard error envelope with code, message, and optional field-level details.
  explanation: A stable error schema keeps client handling predictable.

- prompt: How would you prevent invalid country, language, or currency values from reaching deeper layers?
  question_set: g4mextended
  answer: Normalize and whitelist values at the boundary and reject unknown inputs early.
  explanation: Early rejection prevents bad data from spreading into service and repository logic.

- prompt: If validation rules grow, where would a dedicated validator component fit?
  question_set: g4mextended
  answer: Place a reusable validator between controller and service or as a service collaborator.
  explanation: This keeps controller and service focused while centralizing complex rules.

- prompt: What is the difference between validation failure and business rule failure?
  question_set: g4mextended
  answer: Validation failure means malformed input, while business rule failure means valid input attempted a forbidden action.
  explanation: They represent different failure classes and should be handled distinctly.

- prompt: If replacing hardcoded rates with an external currency API, what component would you add?
  question_set: g4mextended
  answer: Add an exchange-rate provider adapter that wraps external API calls.
  explanation: An adapter isolates third-party integration from business logic.

- prompt: Should service call the currency API directly or through an adapter interface?
  question_set: g4mextended
  answer: Rates should come through an interface adapter so service depends on abstraction.
  explanation: This improves testability, resilience, and provider swap flexibility.

- prompt: How would you handle currency API outages while keeping responses stable?
  question_set: g4mextended
  answer: Use cached or last-known-good rates and degrade gracefully when live fetch fails.
  explanation: Graceful fallback preserves user value during external outages.

- prompt: Where would you cache rates and what TTL would you start with?
  question_set: g4mextended
  answer: Cache rates in the provider layer with a moderate TTL such as 10 to 30 minutes.
  explanation: Provider-level cache centralizes freshness policy and reduces API load.

- prompt: How would you test conversion logic without live API calls?
  question_set: g4mextended
  answer: Inject a fake or mocked rate provider with deterministic rates in tests.
  explanation: Deterministic mocks keep tests fast and reliable.

- prompt: If moving from in-memory to MySQL, what should change and what should remain unchanged?
  question_set: g4mextended
  answer: Repository implementation changes, while service, controller, and presenter contracts should remain stable.
  explanation: Proper layering isolates persistence changes behind repository abstractions.

- prompt: What migration strategy would you propose for existing sample data?
  question_set: g4mextended
  answer: Use idempotent seed migrations with upsert behavior.
  explanation: Idempotent migrations are safe to rerun in repeated deployments.

- prompt: How would you protect data access with transactions when adding writes?
  question_set: g4mextended
  answer: Wrap write workflows in explicit transactions with rollback on failure.
  explanation: Transactions protect consistency for multi-step operations.

- prompt: What indexes would you add first for country visibility and product lookup?
  question_set: g4mextended
  answer: Add composite indexes aligned to visibility filters and primary lookup keys.
  explanation: Indexes should match frequent query patterns first.

- prompt: How would you design repository interfaces to support read and write models cleanly?
  question_set: g4mextended
  answer: Split repository contracts by query and command responsibilities.
  explanation: Focused interfaces reduce coupling and simplify evolution.

- prompt: Where would you add structured logging for easy debugging across layers?
  question_set: g4mextended
  answer: Add structured logs at controller entry and exit, service decisions, and repository calls.
  explanation: Layered logs provide observability across request flow.

- prompt: What metrics would you capture first?
  question_set: g4mextended
  answer: Start with error rate, latency, fallback usage, and invalid input counts.
  explanation: These baseline metrics quickly show reliability and quality trends.

- prompt: How would you trace one request from controller to presenter in logs?
  question_set: g4mextended
  answer: Propagate a correlation ID through all layers and include it in logs.
  explanation: Shared correlation IDs tie distributed log lines to one request.

- prompt: What retry policy is acceptable for external dependencies like currency provider?
  question_set: g4mextended
  answer: Use bounded retries with exponential backoff and jitter for transient failures.
  explanation: Controlled retries improve resilience without causing retry storms.

- prompt: How would you introduce feature flags for enabling API rates per environment?
  question_set: g4mextended
  answer: Drive behavior with centralized configuration flags resolved at composition time.
  explanation: Central flags allow safe rollout and rollback without code scattering.

- prompt: Which security checks belong at request boundary versus business layer?
  question_set: g4mextended
  answer: Boundary handles authentication and input constraints; business layer handles authorization and domain rule checks.
  explanation: Separating responsibilities keeps security logic coherent and maintainable.

- prompt: How should secrets be managed across environments?
  question_set: g4mextended
  answer: Store secrets in environment variables or a secret manager and never in source control.
  explanation: External secret management supports rotation and reduces leak risk.

- prompt: What abuse controls would you add first?
  question_set: g4mextended
  answer: Add rate limiting, request size limits, and audit logging for sensitive actions.
  explanation: These controls mitigate common abuse and provide traceability.

- prompt: What data should never be returned by presenter responses?
  question_set: g4mextended
  answer: Never return secrets, tokens, password hashes, or internal stack traces.
  explanation: Preventing sensitive leakage is a core hardening requirement.

- prompt: Which automated checks should CI run to prevent auth, validation, and security regressions?
  question_set: g4mextended
  answer: Run unit and integration tests plus static analysis and dependency vulnerability scanning.
  explanation: Combining behavior and security checks catches regressions early.

- prompt: A user passes currency equals XYZ; what layer resolves this and what response shape should they get?
  question_set: g4mextended
  answer: Service resolves to a supported fallback currency and returns the normal response schema.
  explanation: Invalid currency handling belongs in business logic while preserving contract shape.

- prompt: The currency API is down for twenty minutes; what fallback keeps the app useful?
  question_set: g4mextended
  answer: Use cached rates or base-currency fallback with clear degraded-mode behavior.
  explanation: Graceful degradation maintains utility during provider outages.

- prompt: A new endpoint requires admin access only; where is the minimum change surface?
  question_set: g4mextended
  answer: Add an authorization guard or policy check at route and service boundary.
  explanation: Focused policy checks avoid unnecessary cross-layer refactors.

- prompt: Validation now depends on country and product type together; where should that rule live?
  question_set: g4mextended
  answer: Put this cross-field rule in service logic or a dedicated domain validator.
  explanation: Cross-context validation belongs where domain semantics are available.

- prompt: You need per-user preferred language and currency; how should this flow from controller to service?
  question_set: g4mextended
  answer: Controller reads trusted user preferences and passes them as explicit service parameters.
  explanation: Boundary extracts context and service applies business behavior.
