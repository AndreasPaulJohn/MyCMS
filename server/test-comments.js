const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';
let testPostId = '';
let testCommentId = '';

function generateUniqueUsername(base) {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function createUser(baseUsername, baseEmail, password, role = 'user') {
  const username = generateUniqueUsername(baseUsername);
  const email = `${username}@example.com`;
  try {
    const response = await axios.post(`${BASE_URL}/users`, { username, email, password, role });
    console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} created:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error creating ${role}:`, error.response ? error.response.data : error.message);
    return null;
  }
}

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
    console.log('Logged in successfully');
    return response.data.token;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function createPost(token) {
  try {
    const response = await axios.post(`${BASE_URL}/posts`, {
      title: `Test Post ${Date.now()}`,
      content: 'This is a test post for comments and search.'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Post created:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating post:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function createComment(token, postId, content) {
  try {
    const response = await axios.post(`${BASE_URL}/comments`, {
      content,
      post_id: postId
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Comment created:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating comment:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function getComments(postId) {
  try {
    const response = await axios.get(`${BASE_URL}/comments/post/${postId}`);
    console.log('Comments retrieved:', response.data);
  } catch (error) {
    console.error('Error getting comments:', error.response ? error.response.data : error.message);
  }
}

async function updateComment(token, commentId, content) {
  try {
    const response = await axios.put(`${BASE_URL}/comments/${commentId}`, {
      content
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Comment updated:', response.data);
  } catch (error) {
    console.error('Error updating comment:', error.response ? error.response.data : error.message);
  }
}

async function deleteComment(token, commentId) {
  try {
    await axios.delete(`${BASE_URL}/comments/${commentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error.response ? error.response.data : error.message);
  }
}

async function moderateComment(token, commentId, status) {
  try {
    const response = await axios.patch(`${BASE_URL}/comments/${commentId}/moderate`, 
      { status },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log(`Comment moderated (${status}):`, response.data);
  } catch (error) {
    console.error('Error moderating comment:', error.response ? error.response.data : error.message);
  }
}

// ... (vorheriger Code bleibt unverändert)

async function testSearch() {
  try {
    console.log('Testing search function...');
    
    // Suche nach Titel
    console.log('Searching by title...');
    const titleSearchResponse = await axios.get(`${BASE_URL}/posts/search`, {
      params: { query: 'Test', type: 'title' }
    });
    console.log('Search by title results:', titleSearchResponse.data);

    // Suche nach Inhalt
    console.log('Searching by content...');
    const contentSearchResponse = await axios.get(`${BASE_URL}/posts/search`, {
      params: { query: 'test', type: 'content' }
    });
    console.log('Search by content results:', contentSearchResponse.data);

    // Allgemeine Suche
    console.log('Performing general search...');
    const generalSearchResponse = await axios.get(`${BASE_URL}/posts/search`, {
      params: { query: 'test' }
    });
    console.log('General search results:', generalSearchResponse.data);

    console.log('Search function tests completed.');
  } catch (error) {
    console.error('Error testing search function:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    console.error('Full error object:', error);
  }
}


// ... (restlicher Code bleibt unverändert)

async function runTests() {
  console.log('Starting tests...');

  try {
    const admin = await createUser('admin_test', 'admin_test', 'adminpass123', 'admin');
    if (!admin) throw new Error('Failed to create admin user');

    const user = await createUser('user_test', 'user_test', 'userpass123');
    if (!user) throw new Error('Failed to create regular user');

    adminToken = await login(admin.email, 'adminpass123');
    if (!adminToken) throw new Error('Failed to login as admin');

    userToken = await login(user.email, 'userpass123');
    if (!userToken) throw new Error('Failed to login as user');

    testPostId = await createPost(adminToken);
    if (!testPostId) throw new Error('Failed to create test post');

    testCommentId = await createComment(userToken, testPostId, 'This is a test comment.');
    if (!testCommentId) throw new Error('Failed to create test comment');

    await getComments(testPostId);
    await updateComment(userToken, testCommentId, 'This is an updated test comment.');
    await updateComment(adminToken, testCommentId, 'Admin updated this comment.');
    await moderateComment(adminToken, testCommentId, 'approved');
    await getComments(testPostId);
    await deleteComment(userToken, testCommentId);

    const adminCommentId = await createComment(adminToken, testPostId, 'This is an admin comment.');
    if (adminCommentId) {
      await deleteComment(adminToken, adminCommentId);
    }

    console.log('Comment tests completed successfully.');

    // Run search tests
    console.log('Starting search tests...');
    await testSearch();
    console.log('Search tests completed.');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests()
  .then(() => {
    console.log('All tests finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });