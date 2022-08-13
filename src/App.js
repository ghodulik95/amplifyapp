import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listBlogs } from './graphql/queries';
import { createBlog as createBlogMutation, deleteBlog as deleteBlogMutation } from './graphql/mutations';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { DataStore } from '@aws-amplify/datastore';
import { Blog } from './models';

Amplify.configure(awsExports);

const initialFormState = { name: '', description: '' }

function App({ signOut }) {
  const [notes, setBlogs] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const apiData = await API.graphql({ query: listBlogs });
    setBlogs(apiData.data.listBlogs.items);
  }

  async function createBlog() {
    if (!formData.name) return;
    console.log("saving");
    await DataStore.save(
    new Blog({
		"name": formData.name,
		"posts": []
	})
    );
    console.log("saving");
    setBlogs([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteBlog({ id }) {
    const newBlogsArray = notes.filter(note => note.id !== id);
    setBlogs(newBlogsArray);
    const modelToDelete = await DataStore.query(Blog, id);
       DataStore.delete(modelToDelete);
  }

  return (
    <div className="App">
      <h1>My Blogs App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Blog name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Blog description"
        value={formData.description}
      />
      <button onClick={createBlog}>Create Blog</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteBlog(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
    </div>
  );
}

export default withAuthenticator(App);