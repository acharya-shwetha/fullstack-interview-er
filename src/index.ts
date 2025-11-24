import app from "./app";

// Creation of app is moved into app.ts
// so that testcases can be written using app.

const port = 3099;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
