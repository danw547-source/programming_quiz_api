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
