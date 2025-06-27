# My Next.js App

This is a simple Next.js application designed for SEO-friendly rendering. The application is structured to include reusable components and global styles.

## Project Structure

```
my-nextjs-app
├── pages
│   ├── index.tsx          # Main entry point of the application
│   └── _app.tsx           # Custom App component for layout persistence
├── components
│   └── ExampleComponent.tsx # Reusable component used throughout the application
├── public
│   └── favicon.ico         # Favicon for the application
├── styles
│   └── globals.css         # Global CSS styles
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
└── README.md               # Project documentation
```

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-nextjs-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` to see the application in action.

## Usage

- The main page is located at `pages/index.tsx`.
- You can customize the layout and add global styles in `styles/globals.css`.
- Reusable components can be created in the `components` directory.

## License

This project is licensed under the MIT License.