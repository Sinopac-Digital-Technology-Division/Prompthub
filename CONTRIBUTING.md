### Getting Started

To get started, follow these steps:

1. **Fork the repository** and clone it locally:

   ```bash
   git clone https://github.com/sino-sandbox/prompthub.git
   cd prompthub
   ```

2. Install dependencies using Yarn:

   ```bash
   yarn install
   ```

   - If you encountered errors installing `better-sqlite3`, that is because it requires python>=3.12. Make sure you have that installed.

3. Run the development server:
   ```bash
   yarn dev
   ```

### How to Contribute

1. Open an Issue First

   Before making any changes to the project (e.g., adding new features, modifying existing code, or fixing bugs), please first check the issue page to see if someone has already raised a similar issue. If not, submit a new Issue to discuss your proposed changes. Use the provided **Issue template** to ensure your submission is clear and actionable.

2. Create a Branch

   Create a new branch for your contribution. Use a meaningful name like: `feature/add-new-component` or `bugfix/fix-navbar-issue`

3. Make Changes

   - Use Prettier for code formatting

4. Commit Your Changes

   Please write commit messages following the `<type>: <subject>` format:

   - `type`: Represents the category of the commit, such as `feat` or `fix`.
   - `subject`: A brief description of the commit.

5. Push and Submit a Pull Request

   Push your branch to your fork and open a Pull Request(PR) on GitHub:

   ```bash
   git push origin bugfix/fix-navbar-issue
   ```
