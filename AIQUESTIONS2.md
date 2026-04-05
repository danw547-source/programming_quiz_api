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
