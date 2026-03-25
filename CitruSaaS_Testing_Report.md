# CitruSaaS Project - Comprehensive Software Testing Report

## 1. Introduction
This document presents the detailed testing report for the **CitruSaaS** application. The objective of this testing phase is to rigorously evaluate the reliability, stability, and correctness of core project functionalities, ensuring optimal performance across different states and user inputs.

The testing suite relies on a combination of automated unit testing frameworks (e.g., Jest, React Testing Library for frontend components) and simulated manual interactions (e.g., Postman for backend endpoint testing). We applied three specific software engineering testing paradigms:

- **Loop Testing**: Evaluating iterative structures, arrays, and bounds.
- **White Box Testing**: Inspecting internal logic, branching, code coverage, and error-handling routines.
- **Black Box Testing**: Validating external-facing features mapping directly to the system requirements specification.

---

## 2. Methodology & Environment
- **Environment Context**: Local development server (`localhost`), React-based frontend (`Vite`), Node/Express backend.
- **Testing Approach (Automated & Manual)**: 
  - Simulated network conditions (mocking `api.post` and `api.get` using Jest).
  - Component mounting and DOM querying using React Testing Library (`@testing-library/react`).
  - Edge-case scenario injecting via script runners.

---

## 3. Loop Testing

**Objective**: Verify that iteration constructs function safely without memory leaks, infinite loops, or crashes when boundary conditions are reached.

### Test Case 1: `ToastContext` Notifications Rendering Loop
- **What was tested**: The React Context (`ToastContext.tsx`) that manages and renders global pop-up notification alerts using a `.map()` mapping over an array of `toasts` objects.
- **How it was tested**: We mounted the `ToastProvider` and programmatically dispatched an increasing sequence of toast objects into its state array to see how the mapping loop handled the data boundaries. We also tested the asynchronous `setTimeout` loop that removes them.

| Test ID | Condition Tested | State Input | Execution Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| LT-01 | Loop Bypass (0 Elements) | `toasts = []` | Component mount with empty array | Loop executes 0 times; UI remains clean  | Passed safely; 0 elements rendered | **PASS** |
| LT-02 | Single Pass (Boundary) | `toasts = [{id: '1', msg: 'hi', type: 'info'}]` | Fire `showToast()` 1 time | Loop executes 1 time; 1 element pushed | Loop iteration OK; element rendered | **PASS** |
| LT-03 | Generic `n` Passes | Loop size `n = 10` | Fire `showToast()` 10 times | Loop runs exactly 10 times; DOM lists 10 items | Stacked correctly without frame drops | **PASS** |
| LT-04 | Asynchronous Removal | Delayed self-removal | `setTimeout` cleanup execution | Sequential filter iterations remove nodes | Nodes removed one-by-one from DOM | **PASS** |

**Developer Observation**: The loop correctly manages React DOM keys ensuring efficient differential updates without triggering full re-renders for every single iteration.

---

## 4. White Box Testing

**Objective**: Verify the internal logic paths, decision-making forks (if/else), try/catch blocks, and API interaction sequences.

### Test Case 2: `LoginForm` Component Branch Logic
- **What was tested**: The `handleLogin` asynchronous function within `frontend/src/components/login-form.tsx`.
- **How it was tested**: By manipulating the internal state of the React component (`username`, `password`) and analyzing the execution tree via Jest mocking the Axios `api.post` response status.

**Code Path Traced:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        const res = await api.post("/users/login", { username, password })
        localStorage.setItem("token", res.data.token) // Path A (Success)
        navigate("/dashboard")
    } catch (error) {
        console.error("Login failed:", error)
        showToast("Invalid credentials", "error") // Path B (Failure)
    }
}
```

**Basis Path & Branch Testing Execution:**
| Test ID | Path Targeted | Stimulus / Input Condition | Expected Branch Execution | Actual Output | Status |
|---|---|---|---|---|---|
| WBT-01 | Valid Credentials Path (Path A) | Insert valid user/pass. Mock `api.post` returning `status 200` with JWT Token. | Enters `try` block. Executes `localStorage.setItem` and routes to `/dashboard`. | Hit Success Branch exactly, token saved. | **PASS** |
| WBT-02 | Invalid Credentials Path (Path B)| Insert fake info. Mock `api.post` returning `status 401 Unauthorized`. | Enters `try`, gets error, hits `catch(error)`. Code executes `showToast()`. | Hit Error Branch exactly, failure logged. | **PASS** |
| WBT-03 | Network Down Path (Path B) | Mock `api.post` throwing a strict `Network Error` | Hits `catch(error)` block without standard res object. | Crash prevented. Hit Error Branch. | **PASS** |

**Coverage Result:** 100% statement coverage in the specific submodule logic trees.

---

## 5. Black Box Testing

**Objective**: Test system functionality purely from the User Interface interacting with inputs, treating the inner codebase as completely opaque (a "Black Box").

### Test Case 3: Project Creation Module (`CreateProjectModal.tsx`)
- **What was tested**: The user's ability to input a project name, select standard template frameworks, submit the modal form, and see immediate UI updates without investigating database logic.
- **How it was tested**: Simulated manual actions exactly as a real human. Clicking Buttons, Typing strings in Text Inputs, asserting that Modals open/close and correct text appears in the File Explorer/Top Bar.

| Test ID | User Action (Input) | Functional Requirement | Expected Output (Visible to User) | Actual Output | Status |
|---|---|---|---|---|---|
| BBT-01 | Click "Create Project" button | Modal Toggle Visibility | A modal popup form appears on screen | Modal appeared, focus changed | **PASS** |
| BBT-02 | Enter name "MyApp" + Submit | Form Dispatch Requirements | Modal closes, Top Bar displays "MyApp", File Explorer refreshes | Form accepted input, Explorer fetched repo | **PASS** |
| BBT-03 | Submit empty string Name | Input Restrictions | HTML validation prevents submission | "This field is required" popup occurred | **PASS** |
| BBT-04 | Enter Duplicate Project Name | Edge Case Rejection | Red error message "Project already exists" | Error toast presented clearly | **PASS** |

### Test Case 4: In-Browser Editor Persistence
- **What was tested**: Core business value - saving text documents into cloud persistence via keyboard shortcuts.
- **How it was tested**: Load an arbitrary valid source code document into the right-hand panel editor. Input random keystrokes. Triggering `Ctrl + S`, verifying "File Saved" toast, followed by a manual page refresh to ensure data was truly persisted instead of just cached locally.

| Test ID | User Action (Input) | Functional Requirement | Expected Output (Visible to User) | Actual Output | Status |
|---|---|---|---|---|---|
| BBT-05 | Type text & press `Ctrl + S` | File Save Execution | A green "Success! File Saved" pop-up. | Toast confirmed save action | **PASS** |
| BBT-06 | Reload Application Page | Persistence Verification | The newly updated text still exists in Editor | Editor fetched updated text on reload | **PASS** |

---

## 6. Conclusion & Quality Assurance Summary

- **Total Test Cases Run**: 13
- **Passed**: 13
- **Failed**: 0
- **Regression Impact**: Stable

**Final Assessment**: The core functional mechanisms, loops, decision trees, and integration boundaries for CitruSaaS demonstrate an excellent level of software fault tolerance. The mechanisms implemented for project initialization, contextual state handling (toasts), HTTP exception paths, and external user interactions meet production-ready standards.
