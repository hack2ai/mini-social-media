require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Start Express Server
app.listen(PORT, () => {
  console.log("====================================");
  console.log(`🚀 Server Running`);
  console.log(`🌍 http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log("====================================");
});