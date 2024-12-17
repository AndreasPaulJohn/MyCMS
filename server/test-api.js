const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let adminUser = null;

async function createUniqueAdminUser() {
  console.log('Creating admin user...');
  const timestamp = Date.now();
  try {
    const response = await axios.post(`${BASE_URL}/users`, {
      username: `admin${timestamp}`,
      email: `admin${timestamp}@example.com`,
      password: 'adminPassword123!',
      role: 'admin'
    });
    console.log('Admin user created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating admin user:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function loginAsAdmin(email, password) {
  console.log('Logging in as admin...');
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email,
      password
    });
    authToken = response.data.token;
    console.log('Admin logged in successfully');
  } catch (error) {
    console.error('Error logging in as admin:', error.response ? error.response.data : error.message);
  }
}

async function testPostOperations() {
  console.log('Testing post operations...');

  // Test creating a post
  let createdPostId;
  try {
    const response = await axios.post(`${BASE_URL}/posts`, {
      title: `Test Post ${Date.now()}`,
      content: 'This is a test post.'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('Post created:', response.data);
    createdPostId = response.data.id;
  } catch (error) {
    console.error('Error creating post:', error.response ? error.response.data : error.message);
  }

  // Test deleting a post
  if (createdPostId) {
    try {
      await axios.delete(`${BASE_URL}/posts/${createdPostId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error.response ? error.response.data : error.message);
    }
  }
}

async function testCategoryOperations() {
  console.log('Testing category operations...');

  // Test creating a category
  let createdCategoryId;
  try {
    const response = await axios.post(`${BASE_URL}/categories`, {
      name: `Test Category ${Date.now()}`,
      description: 'This is a test category.'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('Category created:', response.data);
    createdCategoryId = response.data.id;
  } catch (error) {
    console.error('Error creating category:', error.response ? error.response.data : error.message);
  }

  // Test updating a category
  if (createdCategoryId) {
    try {
      const response = await axios.put(`${BASE_URL}/categories/${createdCategoryId}`, {
        name: `Updated Test Category ${Date.now()}`,
        description: 'This is an updated test category.'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('Category updated:', response.data);
    } catch (error) {
      console.error('Error updating category:', error.response ? error.response.data : error.message);
    }
  }

  // Test getting all categories
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    console.log('All categories:', response.data);
  } catch (error) {
    console.error('Error getting categories:', error.response ? error.response.data : error.message);
  }

  // Test deleting a category
  if (createdCategoryId) {
    try {
      await axios.delete(`${BASE_URL}/categories/${createdCategoryId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error.response ? error.response.data : error.message);
    }
  }
}

async function runTests() {
  console.log('Starting tests...');
  adminUser = await createUniqueAdminUser();
  if (adminUser) {
    await loginAsAdmin(adminUser.email, 'adminPassword123!');
    await testPostOperations();
    await testCategoryOperations();
  }
  console.log('Tests completed.');
}

runTests().catch(error => console.error('Unhandled error:', error));

// // ... (vorheriger Code bleibt unverändert)

// async function testPostRoutes() {
//   console.log('\nTesting Post Routes:');
  
//   if (!authToken) {
//     console.log('Skipping post tests due to missing auth token');
//     return;
//   }

//   try {
//     // Fetch all posts before creating a new one
//     console.log('Fetching all posts before creation...');
//     let posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('Posts before creation:', posts.data);

//     // Test post creation
//     console.log('Attempting to create post...');
//     const newPost = await axios.post(`${BASE_URL}/posts`, {
//       title: 'Test Post ' + Date.now(),
//       content: 'This is a test post content.',
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post created:', newPost.data);
//     createdPostId = newPost.data.id;

//     // Fetch all posts after creating a new one
//     console.log('Fetching all posts after creation...');
//     posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('Posts after creation:', posts.data);

//     // ... (rest of the code remains the same)
//   } catch (error) {
//     logError('Error in post operations:', error);
//   }
// }

// ... (rest of the code remains the same)


// const axios = require('axios');

// const BASE_URL = 'http://localhost:5000/api';
// let authToken = '';
// let createdPostId = null;

// async function testUserRoutes() {
//   console.log('Testing User Routes:');
  
//   try {
//     // Test user creation
//     console.log('Attempting to create user...');
//     const newUser = await axios.post(`${BASE_URL}/users`, {
//       username: 'testuser' + Date.now(),
//       email: `testuser${Date.now()}@example.com`,
//       password: 'password123',
//       role: 'user'
//     });
//     console.log('User created:', newUser.data);

//     // Test user login
//     console.log('Attempting to log in...');
//     const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
//       email: newUser.data.email,
//       password: 'password123'
//     });
//     authToken = loginResponse.data.token;
//     console.log('User logged in, token received');
//   } catch (error) {
//     logError('Error in user operations:', error);
//   }
// }

// async function testPostRoutes() {
//   console.log('\nTesting Post Routes:');
  
//   if (!authToken) {
//     console.log('Skipping post tests due to missing auth token');
//     return;
//   }

//   try {
//     // Test post creation
//     console.log('Attempting to create post...');
//     const newPost = await axios.post(`${BASE_URL}/posts`, {
//       title: 'Test Post ' + Date.now(),
//       content: 'This is a test post content.',
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post created:', newPost.data);
//     createdPostId = newPost.data.id;

//     // Test get all posts
//     console.log('Fetching all posts...');
//     const posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('All posts:', posts.data);

//     // Test get single post
//     console.log('Fetching single post...');
//     const singlePost = await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     console.log('Single post:', singlePost.data);

//     // Test update post
//     console.log('Updating post...');
//     const updatedPost = await axios.put(`${BASE_URL}/posts/${createdPostId}`, {
//       title: 'Updated Test Post',
//       content: 'This is updated content.'
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Updated post:', updatedPost.data);

//     // Test delete post
//     console.log('Deleting post...');
//     await axios.delete(`${BASE_URL}/posts/${createdPostId}`, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post deleted successfully');

//     // Verify deletion
//     console.log('Attempting to fetch deleted post...');
//     try {
//       await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     } catch (error) {
//       if (error.response && error.response.status === 404) {
//         console.log('Post successfully deleted and not found.');
//       } else {
//         throw error;
//       }
//     }
//   } catch (error) {
//     logError('Error in post operations:', error);
//   }
// }

// function logError(message, error) {
//   console.error(message);
//   if (error.response) {
//     console.error('Response status:', error.response.status);
//     console.error('Response data:', error.response.data);
//     console.error('Response headers:', error.response.headers);
//   } else if (error.request) {
//     console.error('No response received. Request:', error.request);
//   } else {
//     console.error('Error message:', error.message);
//   }
//   console.error('Error config:', error.config);
// }

// async function runTests() {
//   await testUserRoutes();
//   await testPostRoutes();
// }

// runTests();








// const axios = require('axios');

// const BASE_URL = 'http://localhost:5000/api';
// let authToken = '';
// let createdPostId = null;

// async function testUserRoutes() {
//   console.log('Testing User Routes:');
  
//   try {
//     // Test user creation
//     console.log('Attempting to create user...');
//     const newUser = await axios.post(`${BASE_URL}/users`, {
//       username: 'testuser' + Date.now(),
//       email: `testuser${Date.now()}@example.com`,
//       password: 'password123',
//       role: 'user'
//     });
//     console.log('User created:', newUser.data);

//     // Test user login
//     console.log('Attempting to log in...');
//     const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
//       email: newUser.data.email,
//       password: 'password123'
//     });
//     authToken = loginResponse.data.token;
//     console.log('User logged in, token received');
//   } catch (error) {
//     logError('Error in user operations:', error);
//   }
// }

// async function testPostRoutes() {
//   console.log('\nTesting Post Routes:');
  
//   if (!authToken) {
//     console.log('Skipping post tests due to missing auth token');
//     return;
//   }

//   try {
//     // Test post creation
//     console.log('Attempting to create post...');
//     const newPost = await axios.post(`${BASE_URL}/posts`, {
//       title: 'Test Post ' + Date.now(),
//       content: 'This is a test post content.',
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post created:', newPost.data);
//     createdPostId = newPost.data.id;

//     // Test get all posts
//     console.log('Fetching all posts...');
//     const posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('All posts:', posts.data);

//     // Test get single post
//     console.log('Fetching single post...');
//     const singlePost = await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     console.log('Single post:', singlePost.data);

//     // Test update post
//     console.log('Updating post...');
//     const updatedPost = await axios.put(`${BASE_URL}/posts/${createdPostId}`, {
//       title: 'Updated Test Post',
//       content: 'This is updated content.'
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Updated post:', updatedPost.data);

//     // Test delete post
//     console.log('Deleting post...');
//     await axios.delete(`${BASE_URL}/posts/${createdPostId}`, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post deleted successfully');

//     // Verify deletion
//     console.log('Attempting to fetch deleted post...');
//     try {
//       await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     } catch (error) {
//       if (error.response && error.response.status === 404) {
//         console.log('Post successfully deleted and not found.');
//       } else {
//         throw error;
//       }
//     }
//   } catch (error) {
//     logError('Error in post operations:', error);
//   }
// }

// function logError(message, error) {
//   console.error(message);
//   if (error.response) {
//     console.error('Response status:', error.response.status);
//     console.error('Response data:', error.response.data);
//     console.error('Response headers:', error.response.headers);
//   } else if (error.request) {
//     console.error('No response received. Request:', error.request);
//   } else {
//     console.error('Error message:', error.message);
//   }
//   console.error('Error config:', error.config);
// }

// async function runTests() {
//   await testUserRoutes();
//   await testPostRoutes();
// }

// runTests();


// const axios = require('axios');

// const BASE_URL = 'http://localhost:5000/api';
// let authToken = '';
// let createdPostId = null;

// async function testUserRoutes() {
//   console.log('Testing User Routes:');
  
//   try {
//     // Test user creation
//     console.log('Attempting to create user...');
//     const newUser = await axios.post(`${BASE_URL}/users`, {
//       username: 'testuser' + Date.now(),
//       email: `testuser${Date.now()}@example.com`,
//       password: 'password123',
//       role: 'user'
//     });
//     console.log('User created:', newUser.data);

//     // Test user login
//     console.log('Attempting to log in...');
//     const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
//       email: newUser.data.email,
//       password: 'password123'
//     });
//     authToken = loginResponse.data.token;
//     console.log('User logged in, token received');
//   } catch (error) {
//     console.error('Error in user operations:', error.response ? error.response.data : error.message);
//   }
// }

// async function testPostRoutes() {
//   console.log('\nTesting Post Routes:');
  
//   if (!authToken) {
//     console.log('Skipping post tests due to missing auth token');
//     return;
//   }

//   try {
//     // Test post creation
//     console.log('Attempting to create post...');
//     const newPost = await axios.post(`${BASE_URL}/posts`, {
//       title: 'Test Post ' + Date.now(),
//       content: 'This is a test post content.',
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post created:', newPost.data);
//     createdPostId = newPost.data.id;

//     // Test get all posts
//     console.log('Fetching all posts...');
//     const posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('All posts:', posts.data);

//     // Test get single post
//     console.log('Fetching single post...');
//     const singlePost = await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     console.log('Single post:', singlePost.data);

//     // Test update post
//     console.log('Updating post...');
//     const updatedPost = await axios.put(`${BASE_URL}/posts/${createdPostId}`, {
//       title: 'Updated Test Post',
//       content: 'This is updated content.'
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Updated post:', updatedPost.data);

//     // Test delete post
//     console.log('Deleting post...');
//     await axios.delete(`${BASE_URL}/posts/${createdPostId}`, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post deleted successfully');

//     // Verify deletion
//     console.log('Attempting to fetch deleted post...');
//     try {
//       await axios.get(`${BASE_URL}/posts/${createdPostId}`);
//     } catch (error) {
//       if (error.response && error.response.status === 404) {
//         console.log('Post successfully deleted and not found.');
//       } else {
//         throw error;
//       }
//     }
//   } catch (error) {
//     console.error('Error in post operations:', error.response ? error.response.data : error.message);
//   }
// }

// async function runTests() {
//   await testUserRoutes();
//   await testPostRoutes();
// }

// runTests();



// const axios = require('axios');

// const BASE_URL = 'http://localhost:5000/api';
// let authToken = '';

// async function testUserRoutes() {
//   console.log('Testing User Routes:');
  
//   try {
//     // Test user creation
//     console.log('Attempting to create user...');
//     const newUser = await axios.post(`${BASE_URL}/users`, {
//       username: 'testuser' + Date.now(),
//       email: `testuser${Date.now()}@example.com`,
//       password: 'password123',
//       role: 'user'
//     });
//     console.log('User created:', newUser.data);

//     // Test user login
//     console.log('Attempting to log in...');
//     const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
//       email: newUser.data.email,
//       password: 'password123'
//     });
//     authToken = loginResponse.data.token;
//     console.log('User logged in, token received');
//   } catch (error) {
//     console.error('Error in user operations:');
//     if (error.response) {
//       console.error('Response status:', error.response.status);
//       console.error('Response data:', error.response.data);
//       console.error('Response headers:', error.response.headers);
//     } else if (error.request) {
//       console.error('No response received. Request:', error.request);
//     } else {
//       console.error('Error setting up request:', error.message);
//     }
//     console.error('Error config:', error.config);
//   }
// }

// async function testPostRoutes() {
//   console.log('\nTesting Post Routes:');
  
//   if (!authToken) {
//     console.log('Skipping post tests due to missing auth token');
//     return;
//   }

//   try {
//     // Test post creation
//     console.log('Attempting to create post...');
//     const newPost = await axios.post(`${BASE_URL}/posts`, {
//       title: 'Test Post',
//       content: 'This is a test post content.',
//       author_id: 1 // Assuming the first user has ID 1
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post created:', newPost.data);

//     // Test get all posts
//     console.log('Fetching all posts...');
//     const posts = await axios.get(`${BASE_URL}/posts`);
//     console.log('All posts:', posts.data);

//     // Test get single post
//     console.log('Fetching single post...');
//     const singlePost = await axios.get(`${BASE_URL}/posts/${newPost.data.id}`);
//     console.log('Single post:', singlePost.data);

//     // Test update post
//     console.log('Updating post...');
//     const updatedPost = await axios.put(`${BASE_URL}/posts/${newPost.data.id}`, {
//       title: 'Updated Test Post'
//     }, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Updated post:', updatedPost.data);

//     // Test delete post
//     console.log('Deleting post...');
//     await axios.delete(`${BASE_URL}/posts/${newPost.data.id}`, {
//       headers: { 'Authorization': `Bearer ${authToken}` }
//     });
//     console.log('Post deleted successfully');
//   } catch (error) {
//     console.error('Error in post operations:');
//     if (error.response) {
//       console.error('Response status:', error.response.status);
//       console.error('Response data:', error.response.data);
//       console.error('Response headers:', error.response.headers);
//     } else if (error.request) {
//       console.error('No response received. Request:', error.request);
//     } else {
//       console.error('Error setting up request:', error.message);
//     }
//     console.error('Error config:', error.config);
//   }
// }

// async function runTests() {
//   await testUserRoutes();
//   await testPostRoutes();
// }

// runTests();