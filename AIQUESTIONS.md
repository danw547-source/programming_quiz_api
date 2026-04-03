# Interview Prep: Gear4Music Programming Challenge

## 1. Can you summarize the system you built?
**Answer:**
- I built a small PHP inventory app that manages products and lets users search and filter them.
- I used a simple architecture with Controller, Service, Repository, and Presenter so each piece has one job.
- This matters because it makes debugging easier and code easier to change later.

## 2. What were the main requirements, and how did you map them to classes?
**Answer:**
- Requirement: hold products and find them quickly. I created Model/Product.php and Model/DigitalProduct.php.
- Requirement: business rules (searching or condition logic). I put that in Service/InventoryService.php.
- Requirement: data access should be easy to replace. I used Repository/InMemoryProductRepository.php and Contract/InventoryInterface.php.
- Requirement: display results cleanly. The View/InventoryPresenter.php handles formatting output.
- Explaining this helps interviewers see you can translate needs into code structure.

## 3. Why did you choose Controller-Service-Repository?
**Answer:**
- Controller handles request flow, Service handles rules, Repository handles storage.
- Separating them means one change usually affects only one file.
- It shows awareness of good design and reduces accidental bugs.

## 4. How does your design support adding new product types or filters?
**Answer:**
- New types can inherit Product (like DigitalProduct) so shared behavior is reused.
- Filter logic lives in InventoryService, so adding a new filter usually means a new method there.
- This is important because a flexible design grows as requirements grow.

## 5. Give an example of SOLID in your project.
**Answer:**
- Single Responsibility: each class has one reason to change (data, logic, presentation).
- Open/Closed: we can add DigitalProduct without changing existing Product code.
- Liskov Substitution: DigitalProduct works anywhere Product is used.
- Interface Segregation: InventoryInterface contains only inventory methods.
- Dependency Inversion: high-level code (controller) uses interfaces, not concrete classes.

## 6. Why add an interface now if there is only one repository?
**Answer:**
- It lets you switch implementation easily (e.g., from memory to database) without rewriting service.
- It makes unit tests easy with mocks.
- It demonstrates you can build code that scales.

## 7. What improves with more time?
**Answer:**
- Add unit tests across Service and Repository for confidence.
- Add a real database and persistence.
- Add error handling (invalid input, missing fields).
- Add clear input validation and consistent error messages.

## 8. What validation and error handling would you add in production?
**Answer:**
- Add validation methods to check input types, ranges, and dependencies.
- Use exceptions for invalid states and provide user-friendly error messages.
- Implement consistent validation across all user inputs (country, language, currency, product data).

## 9. What tradeoffs did you make (speed vs robustness)?
**Answer:**
- Chose in-memory storage for fast development and easier debugging.
- Skipped advanced features (pagination, authentication) to prove main functionality quickly.
- Kept code clean so adding robustness later is straightforward.

## 10. What is InventoryPresenter for?
**Answer:**
- It converts raw product objects into a display format, keeping display concerns separate.
- This keeps business logic in InventoryService and makes it easier to support different outputs (CLI, API, HTML).

## 11. How would you add a REST API endpoint?
**Answer:**
- Keep InventoryService and Repository the same.
- Add routing/controller that accepts HTTP requests, calls service methods, returns JSON through presenter.
- This shows the core isn't tied to UI technology.

## 12. How do you keep code readable and maintainable?
**Answer:**
- Used folders and namespaces by responsibility.
- Each method is short and named after its task.
- I added comments and kept class responsibilities small.

## 13. What assumptions did you make?
**Answer:**
- Inventory fits in memory for this challenge.
- No user authentication required.
- Basic product attributes are enough for example search and filter.

## 14. Describe your development process.
**Answer:**
- Read challenge, identify core use cases.
- Design simple domain model and layer separation.
- Implement and run demo.php to validate behavior.
- Tidy code and add explanations in readme.

## 15. How did you test it manually?
**Answer:**
- Run php demo.php to see sample search results.
- Check that each filter and sort path works as expected.
- Update code and repeat until output is stable.

## 16. How would you test this with PHPUnit?
**Answer:**
- I would write unit tests for `InventoryService` and `InMemoryProductRepository` because they contain the business rules and data behavior.
- Each test would set up sample products, call a method like `searchProducts`, and assert expected results.
- For beginners: this means codifying the behavior so changes won’t break existing features. It helps catch bugs early and makes refactoring safer.

## 17. How does your code behave with 1000+ products, and what should change for scale?
**Answer:**
- Currently, all products are in-memory and I scan them linearly for each query. Works fine for small datasets (100s), but would slow down at 1000+ due to repeated loops.
- For scale, I would add indexing, caching, or a database query layer (e.g., SQLite/MySQL) outside the loop.
- This is important because real users need reliable response times; knowing the limit shows you can plan ahead.

## 18. How would you add persistence (MySQL/Redis) concretely?
**Answer:**
- Create a new repository class, e.g., `DatabaseProductRepository`, implementing `Contract/InventoryInterface` and move data access SQL/Redis logic there.
- Keep `InventoryService` unchanged; it just talks to the interface. Then set up DI so controller can choose the implementation.
- This matters because separating the interface from implementation lets your app run in production without changing business logic, and it makes testing easier with mock objects.

## 19. How did you implement multi-language support for product names?
Answer:
I stored product names as an array in the Product class, like ['en' => 'Guitar', 'fr' => 'Guitare'], so each product can have translations for different languages. In the service, I call getName($language) to pick the right one. This is important because it keeps translations close to the data, makes it easy to add new languages without changing code, and falls back to English or the SKU if a translation is missing—preventing errors and keeping the app user-friendly.

## 20. Why is currency conversion in the service layer, not the model?
Answer:
The Product model only stores the base price in GBP, and conversion happens in InventoryService using hardcoded exchange rates. This is important because it separates data (what the product costs) from business logic (how to display it in different currencies). It also makes the model simpler and reusable—if I add APIs or other outputs, the conversion logic stays in one place, reducing bugs and making changes easier.

## 21. How does country visibility filtering work, and why case-insensitive?
Answer:
Each Product has a visibleInCountries array (e.g., ['GB', 'FR']), and the service checks isVisibleIn($country) before including it. I made it case-insensitive with strtoupper() so 'gb' and 'GB' both work. This matters because real users might enter codes differently, and it prevents simple input errors from hiding products—improving reliability without extra complexity.

## 22. Why use an enum for the Condition class instead of strings?
Answer:
Enums in PHP 8+ let me define fixed values like Condition::New, Condition::Used, and Condition::Refurbished with type safety. It's better than strings because it prevents typos (e.g., 'new' vs 'neew'), makes code autocomplete-friendly, and ensures only valid conditions are used. For beginners, this is like a dropdown menu in code—it reduces mistakes and makes the system more robust as it grows.

## 23. How are digital products different from physical ones, and why inherit from Product?
Answer:
DigitalProduct extends Product but overrides methods like isVisibleIn() to always return true (no country restrictions), isAvailable() to always true (infinite stock), and sets weight/volume to 0 with instant delivery. Inheritance reuses shared code (like names and prices) while customizing behavior. This is important because it follows DRY (Don't Repeat Yourself), makes adding new product types easy, and keeps the code organized without duplicating logic.

## 24. What PHP features did you use, and why are they helpful?
Answer:
I used typed properties (e.g., private string $sku), enums for Condition, and PSR-4 autoloading via Composer. Typed properties catch type mismatches early, enums provide safety for fixed values, and autoloading lets classes load automatically without require statements. These are important for beginners because they make code less error-prone, easier to read, and more professional—PHP's type system helps prevent bugs that could break the app in production.

## 25. How does the JSON output structure support different clients?
Answer:
The InventoryPresenter returns JSON with a context (country/language/currency) and products array, plus a total count. This structure is predictable and self-documenting. It's important because APIs need consistent formats—clients (like mobile apps) can rely on it, and adding fields later won't break existing ones. The pretty-printing and unescaped Unicode keep it human-readable for debugging.

## 26. How would you add more currencies or languages concretely?
Answer:
For currencies, I'd add rates to the RATES array in InventoryService (e.g., 'JPY' => 150.0) and update resolveCurrency(). For languages, I'd add keys to the names array in products (e.g., 'de' => 'Gitarre') and ensure the service passes the language. This is scalable because it doesn't require code changes—just data updates—and keeps the logic flexible for global expansion.

## 27. How does your demo validate the functionality?
Answer:
demo.php runs two examples: one for GB/en/GBP (shows all products) and one for FR/fr/EUR (filters UK-only items, translates names, converts prices). It prints JSON output to check behavior. This is important for beginners because manual testing like this proves the code works before adding automated tests—it catches obvious issues quickly and builds confidence in the system.

## 28. What are some security or input validation concerns here?
Answer:
Inputs like country/language/currency come from users, so I'd add validation (e.g., check if country is a valid ISO code) to prevent bad data. Prices and stock are sanitized by rounding/converting. In production, I'd use prepared statements for databases and escape outputs. This matters because unvalidated inputs can lead to crashes or security issues—starting with basics like this shows awareness of real-world risks.



# AIQuiz Questions (auto-parsed)

- prompt: What is the single responsibility principle, in one sentence?
  answer: Each module or class should have only one reason to change.
  explanation: This is the core idea of SRP.

- prompt: What component in MVC handles user input and routes requests?
  answer: The Controller handles user input and routes requests.
  explanation: Controller processes inputs and coordinates model/view updates.

- prompt: During an interview, if asked to improve performance for 1000+ items, what is a good step?
  answer: Use indexing/caching and move from in-memory full scan to query-optimized storage.
  explanation: This improves scale by reducing linear scan overhead.

- prompt: How does your design support adding new product types or filters?
  answer: New product types can inherit shared behavior and filter rules are kept in the service layer so logic is reusable without touching the controller.
  explanation: Separation of model variants and service filtering makes it easy to extend with minimal changes.

- prompt: Give an example of SOLID in your project.
  answer: Single Responsibility in InventoryService and Repository, and Dependency Inversion where controllers depend on interfaces not concrete classes.
  explanation: Each layer has one reason to change and interfaces allow implementation swaps.

- prompt: Why add an interface now if there is only one repository?
  answer: It enables swapping to another data source later and supports tests with fakes/mocks today.
  explanation: It keeps code modular and avoids business logic being tied to one implementation.

- prompt: What improves with more time?
  answer: Add thorough unit/integration tests, a database backend, more input validation, and robust error handling.
  explanation: Those improvements increase reliability and maintainability.

- prompt: What validation and error handling would you add in production?
  answer: Add input validation for types and ranges, use exceptions for invalid states, and provide user-friendly error messages across all endpoints.
  explanation: Proper validation prevents crashes and security issues while keeping the system robust for real users.

- prompt: What tradeoffs did you make (speed vs robustness)?
  answer: Chose simple in-memory storage and minimal features to deliver functionality quickly, with the tradeoff that large datasets may need refactor.
  explanation: Prioritizing MVP speed is acceptable early, with robustness added later.

- prompt: What is InventoryPresenter for?
  answer: It formats raw domain objects into view-friendly output so business logic stays separated from presentation concerns.
  explanation: This makes it easier to support multiple output formats and keep services clean.

- prompt: How would you add a REST API endpoint?
  answer: Add route/controller method, call service method, and return JSON; keep business logic in service and data access in repository.
  explanation: This keeps layering consistent and makes APIs easy to maintain.

- prompt: How do you keep code readable and maintainable?
  answer: Use small focused functions, clear naming, folder structure, and comments describing intent.
  explanation: Readable code is easier to review and refactor safely.

- prompt: What assumptions did you make?
  answer: Data fits in memory, no auth is required, and a single repo is enough at this stage.
  explanation: Being explicit about assumptions helps future work and reviewers evaluate risk.

- prompt: Describe your development process.
  answer: Gather requirements, design architecture, implement core features, run fast manual tests, then add automated tests.
  explanation: This iterative cycle delivers working behavior quickly while improving confidence.

- prompt: How did you test it manually?
  answer: Run the demo app, complete sample flows, and verify each feature works as expected.
  explanation: Manual validation builds initial trust before adding automated tests.

- prompt: How would you test this with PHPUnit?
  answer: Write unit tests for InventoryService and repository methods with stub repositories, and integration tests for API endpoints.
  explanation: Focus on business rules and layered behavior for reliable regression checks.

- prompt: How does your code behave with 1000+ products, and what should change for scale?
  answer: It currently scans in-memory lists and may slow; scaling needs database queries, indexing, and pagination.
  explanation: Identifying scale limitations guides the architecture upgrade plan.

- prompt: How would you add persistence (MySQL/Redis) concretely?
  answer: Create a new DatabaseProductRepository implementing the same interface, use DI in controllers, and keep services unchanged.
  explanation: This cleanly swaps storage without touching core quiz logic.

- prompt: How did you implement multi-language support for product names?
  answer: Store localized names in Product (e.g., {en, fr}) and resolve via getName(language) with fallback to English or SKU.
  explanation: This keeps translation in the model and avoids scattered formatting logic.

- prompt: Why is currency conversion in the service layer, not the model?
  answer: Product stores base price; InventoryService converts currency with rates, separating data from conversion logic.
  explanation: This makes the model reusable and centralizes business logic.

- prompt: How does country visibility filtering work, and why case-insensitive?
  answer: Products have visibleInCountries array; service checks isVisibleIn(country.upper()) to handle mixed case input.
  explanation: This avoids errors on user input variations and improves reliability.

- prompt: Why use an enum for the Condition class instead of strings?
  answer: Enums ensure valid states (New/Used/Refurbished) with type safety, preventing typos and invalid values.
  explanation: It reduces bugs and improves readability and IDE support.

- prompt: How are digital products different from physical ones, and why inherit from Product?
  answer: DigitalProduct overrides availability/stock/weight, reusing base properties while customizing behavior.
  explanation: Inheritance allows code reuse with clear specialization.

- prompt: What PHP features did you use, and why are they helpful?
  answer: Typed properties, enums, and PSR-4 autoloading for safety, predictability, and cleaner architecture.
  explanation: These features reduce runtime errors and improve developer experience.

- prompt: How does the JSON output structure support different clients?
  answer: Include context info plus products array and total count for consistency across clients.
  explanation: A stable format enables safer frontend/mobile use and easier evolution.

- prompt: How would you add more currencies or languages concretely?
  answer: Add rates in InventoryService and add language entries in product names, keeping process data-driven.
  explanation: This scales without changing core behavior.

- prompt: How does the demo validate the functionality?
  answer: It prints GB/en/GBP and FR/fr/EUR sample outputs to verify locale filtering, translation, and conversion.
  explanation: Manual end-to-end checks confirm real behavior before automation.

- prompt: What are some security or input validation concerns here?
  answer: Validate user inputs, use prepared statements, escape output, and reject invalid currencies/countries.
  explanation: Preventing invalid data avoids crashes and security holes.
