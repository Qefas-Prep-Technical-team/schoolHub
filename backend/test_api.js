const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:8000/exams/papers/all?subjectId=some-id');
    console.log(res.data);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
