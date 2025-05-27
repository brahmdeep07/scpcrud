import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);  // <-- Added state for current index
  const [form, setForm] = useState({
    id: null,
    item: '',
    class: '',
    description: '',
    containment: '',
    image: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    const { data, error } = await supabase.from('scp').select();
    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setRecords(data);
    }
  }

  function handleInputChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

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
    fetchRecords();
    resetForm();
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('scp').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error.message);
      return;
    }
    fetchRecords();
  }

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

    fetchRecords();
    resetForm();
  }

  function resetForm() {
    setForm({ id: null, item: '', class: '', description: '', containment: '', image: '' });
  }

  return (
    <div className="app">
      <nav>
        <h2>SCP Files</h2>
        {records
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((rec, index) => (
            <button
              key={rec.id}
              onClick={() => {
                setSelectedItem(rec);
                setCurrentIndex(index);  // Set the current index on click
                setView('detail');
              }}
            >
              {rec.item}
            </button>
          ))}
        <button onClick={() => setView('admin')}>Admin</button>
      </nav>

      {view === 'detail' && selectedItem && (
        <div className="detail">
          <h2>{selectedItem.item}</h2>
          <h4>{selectedItem.class}</h4>
          <img src={selectedItem.image} alt={selectedItem.item} />
          <p>{selectedItem.description}</p>
          <p>{selectedItem.containment}</p>

          <div className="nav-buttons">
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

            <button onClick={() => setView('home')}>Close</button>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <div className="admin">
          <h2>Admin Panel</h2>
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
                    <button onClick={() => setForm({ ...rec })}>Edit</button>
                    <button onClick={() => handleDelete(rec.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form">
            <input name="item" value={form.item} onChange={handleInputChange} placeholder="Item" />
            <input name="class" value={form.class} onChange={handleInputChange} placeholder="Class" />
            <input name="description" value={form.description} onChange={handleInputChange} placeholder="Description" />
            <input name="containment" value={form.containment} onChange={handleInputChange} placeholder="Containment" />
            <input name="image" value={form.image} onChange={handleInputChange} placeholder="Image URL" />
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
