import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  // State to store all SCP records
  const [records, setRecords] = useState([]);

  // State to control which view is displayed: 'home', 'detail', or 'admin'
  const [view, setView] = useState('home');

  // State to hold the currently selected item for detail view
  const [selectedItem, setSelectedItem] = useState(null);

  // State to track index of selected item for navigation in detail view
  const [currentIndex, setCurrentIndex] = useState(null);

  // State for form inputs, used for both creating and editing entries
  const [form, setForm] = useState({
    id: null,
    item: '',
    class: '',
    description: '',
    containment: '',
    image: '',
  });

  // Fetch records from Supabase when the component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  // Fetch all records from the 'scp' table in Supabase
  async function fetchRecords() {
    const { data, error } = await supabase.from('scp').select();
    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setRecords(data);
    }
  }

  // Handle changes to form inputs
  function handleInputChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  //  creating a new SCP record
  async function handleSubmit() {
    const { error } = await supabase.from('scp').insert([{
      item: form.item,
      class: form.class,
      description: form.description,
      containment: form.containment,
      image: form.image
    }]);
    if (error) {
      console.error('Insert error:', error.message);
      return;
    }
    fetchRecords(); // Refresh the list after insertion
    resetForm();    // Clear form
  }

  //  deleting a record
  async function handleDelete(id) {
    const { error } = await supabase.from('scp').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error.message);
      return;
    }
    fetchRecords(); // Refresh the list after deletion
  }

  //  editing a record
  async function handleEdit(id) {
    const { error } = await supabase.from('scp').update({
      item: form.item,
      class: form.class,
      description: form.description,
      containment: form.containment,
      image: form.image
    }).eq('id', id);

    if (error) {
      console.error('Update error:', error.message);
      return;
    }

    fetchRecords(); // Refresh the list after update
    resetForm();    // Clear form
  }

  // Reset the form to its original state
  function resetForm() {
    setForm({ id: null, item: '', class: '', description: '', containment: '', image: '' });
  }

  return (
    <div className="app">
      {/* Navigation menu */}
      <nav>
        <h2>SCP Files</h2>
        {/* Render a button for each record */}
        {records
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((rec, index) => (
            <button
              key={rec.id}
              onClick={() => {
                setSelectedItem(rec);     // Set selected record for detail view
                setCurrentIndex(index);   // Track its index for navigation
                setView('detail');        // Switch to detail view
              }}
            >
              {rec.item}
            </button>
          ))}
        {/* Admin view button */}
        <button onClick={() => setView('admin')}>Admin</button>
      </nav>

      {/* Detail View */}
      {view === 'detail' && selectedItem && (
        <div className="detail">
          <h2>{selectedItem.item}</h2>
          <h4>{selectedItem.class}</h4>
          <img src={selectedItem.image} alt={selectedItem.item} />
          <p>{selectedItem.description}</p>
          <p>{selectedItem.containment}</p>

          <div className="nav-buttons">
            {/* Back button */}
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setSelectedItem(records[currentIndex - 1]);
                }
              }}
              disabled={currentIndex <= 0}
            >
              Back
            </button>

            {/* Next button */}
            <button
              onClick={() => {
                if (currentIndex < records.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  setSelectedItem(records[currentIndex + 1]);
                }
              }}
              disabled={currentIndex >= records.length - 1}
            >
              Next
            </button>

            {/* Close button to return to home view */}
            <button onClick={() => setView('home')}>Close</button>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {view === 'admin' && (
        <div className="admin">
          <h2>Admin Panel</h2>
          {/* Table displaying all records with edit/delete options */}
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Class</th>
                <th>Description</th>
                <th>Containment</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.item}</td>
                  <td>{rec.class}</td>
                  <td>{rec.description}</td>
                  <td>{rec.containment}</td>
                  <td><img src={rec.image} alt="" width="50" /></td>
                  <td>
                    {/* Set form with existing data to edit */}
                    <button onClick={() => setForm({ ...rec })}>Edit</button>
                    <button onClick={() => handleDelete(rec.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Form for creating or updating records */}
          <div className="form">
            <input name="item" value={form.item} onChange={handleInputChange} placeholder="Item" />
            <input name="class" value={form.class} onChange={handleInputChange} placeholder="Class" />
            <input name="description" value={form.description} onChange={handleInputChange} placeholder="Description" />
            <input name="containment" value={form.containment} onChange={handleInputChange} placeholder="Containment" />
            <input name="image" value={form.image} onChange={handleInputChange} placeholder="Image URL" />
            
            {/* Show Create or Update button depending on form.id */}
            {form.id ? (
              <button onClick={() => handleEdit(form.id)}>Update</button>
            ) : (
              <button onClick={handleSubmit}>Create</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
