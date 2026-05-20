const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const adminId = '172b060d-adae-467b-8101-67d754cef925'; // test School 1 admin ID
const studentId = '71c54ba0-60d2-4db4-9a12-98ef6ab95815';

async function main() {
  const token = jwt.sign(
    { userId: adminId, userType: 'ADMIN' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  console.log("Generated Admin JWT Token:", token);

  try {
    const response = await axios.get(`http://localhost:5000/api/students/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Response Status:", response.status);
    fs.writeFileSync('student_route_out.json', JSON.stringify({
      status: response.status,
      data: response.data
    }, null, 2), 'utf-8');
    console.log("✅ Saved response to student_route_out.json");
  } catch (error) {
    console.error("❌ Request Failed!");
    let errData = {};
    if (error.response) {
      errData = {
        status: error.response.status,
        data: error.response.data
      };
      console.error("Status:", error.response.status);
    } else {
      errData = { error: error.message };
      console.error(error.message);
    }
    fs.writeFileSync('student_route_out.json', JSON.stringify(errData, null, 2), 'utf-8');
  }
}

main();
