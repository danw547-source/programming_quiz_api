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

## 8. How did you handle validation and errors?
**Answer:**
- For the prototype, I did minimal checks and focused on architecture.
- I would add validation methods, exceptions for invalid states, and user-friendly feedback in production.

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

# AIQuiz Questions (auto-parsed)

- prompt: What is the single responsibility principle, in one sentence?
  answer: Each module or class should have only one reason to change.
  explanation: This is the core idea of SRP.

- prompt: In MVC, which component handles user input and routes requests?
  answer: The Controller handles user input and routes requests.
  explanation: Controller processes inputs and coordinates model/view updates.

- prompt: During an interview, if asked to improve performance for 1000+ items, what is a good step?
  answer: Use indexing/caching and move from in-memory full scan to query-optimized storage.
  explanation: This improves scale by reducing linear scan overhead.
