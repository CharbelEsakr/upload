const LargeFileUpload = () => {
  // Your existing code (useState, useEffect, and other functions)
  const { useState, useEffect, Component} = React;
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("./api/index.php?action=get");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
 function showPopup() {
      const popup = document.getElementById('popup');
      popup.style.display = 'block';
    }

  const handleSubmit = async (event) => {
      showPopup();
      event.preventDefault();
    // Start the progress bar
    const progressBar = document.getElementById('progress-bar');
    let width = 0;
    const progressBarInterval = setInterval(updateProgressBar, 10);

    function updateProgressBar() {
      if (width >= 100) {
        clearInterval(progressBarInterval);
      } else {
        width++;
        progressBar.style.width = width + '%';
      }
    }
    
    
const answer1 = event.target.answer1.value;
const answer2 = event.target.answer2.value;
const answer3 = event.target.answer3.value;
const answer4 = event.target.answer4.value;
    // Add other form inputs here
const formData = new FormData();
formData.append("action", "insert");
formData.append("answer1", answer1);
formData.append("answer2", answer2);
formData.append("answer3", answer3);
formData.append("answer4", answer4);


   try {

    const response = await axios.post('./api/index.php', formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        // Update progress bar here
        console.log(`Upload progress: ${progress}%`);
      },
    });

    if (response.data.status === "success") {
      
      if (response.data.redirect) {
  window.location.href = response.data.redirect;
  window.onload = function() {
  progressBar.style.display = 'none';
}
}

      // You can redirect to another page if needed
      // window.location.href = "/success";
      fetchData(); // Fetch data again to refresh the list
      // Enable the submit button after the file upload and progress bar completion
    
      
    } else {
      throw new Error("Error submitting data.");
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }

}

  
  return (
    <div className="App">
      {/* Your existing JSX */}

        <form onSubmit={handleSubmit}>
          <div className="form-section section1">
            <h3> File Upload form </h3>
          </div>
          <label className="input-group">
            اسم
            <input className="input" type="text" name="answer1"/>
          </label>
          <label className="input-group">
            المكان
            <input  className="input" type="text" name="answer2" required/>
          </label>
         
                
                 <label className="input-group">
            Training
            <input  className="input" type="text" name="answer3" required/>
          </label>
                 
                 <label className="input-group" htmlFor="numberInput"> Group Number 
                 <input className="input" type="Number" name= "answer4" min="1" inputMode="numeric"/>
                 </label>


          <div id="progress-bar"></div>

          <button id="submit" className="get" type="submit">
            Submit
          </button>
          <div id="popup">Please wait...</div>
        </form>

        <h2 className="get">Received Data:</h2>
        <ul className="get">
          {data.map((item, index) => (
            <li key={index}>
    {item.answer1} - {item.answer2} - {item.answer3} - {item.answer4}
    {/* Display other fields here */}
  </li>
          ))}
        </ul>
    </div>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      progress: 0,
      allFilesUploaded: false,
    };
  }

  handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    this.setState({ files: selectedFiles });
  };

  handleUpload = async () => {
    const { files, allFilesUploaded } = this.state;
    const submitBtn = document.getElementById('submit');
    
    if (allFilesUploaded === true) {
      submitBtn.click();
      return;
    }
    
    if (files.length === 0) {
      submitBtn.click();
      return;
    }

    this.setState({ uploading: true, progress: 0 });

    const chunkSize = 512 * 1024; // 512KB chunks (you can adjust this size)
    let totalChunks = 0;
    let uploadedChunks = 0;

    const uploadFile = async (file) => {
      const totalChunksForFile = Math.ceil(file.size / chunkSize);
      totalChunks += totalChunksForFile;

      for (let chunkIndex = 0; chunkIndex < totalChunksForFile; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("filename", file.name);
        formData.append("totalChunks", totalChunksForFile);
        formData.append("chunkIndex", chunkIndex);

        try {
          await axios.post("./api/attachments.php", formData);
          uploadedChunks++;
          const progress = (uploadedChunks / totalChunks) * 100;
          this.setState({ progress });
        } catch (error) {
          console.error("Error uploading chunk:", error);
          // Handle error as needed
        }
      }
    };
    
    const promises = files.map((file) => uploadFile(file));

    try {
      await Promise.all(promises);
      // All files have been uploaded successfully
      this.setState({ allFilesUploaded: true });
      submitBtn.click();
      submitBtn.disabled = false;
      // Clear the state after upload
      this.setState({ files: [], progress: 0, allFilesUploaded: false });
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      this.setState({ uploading: false });
    }
  };

  render() {
    const { uploading, progress, allFilesUploaded } = this.state;

    return (
      <div className="App">
        <div className="intro">
          <img className="logo" src="./images/THRC.jpeg" alt="logo img" />
          <h1>File Upload Form</h1>
        </div>
        
        <div className="form">
          <LargeFileUpload />
          <label htmlFor="attachments" className="input-group">
            صور وفديوهات أُخِذت أثناء الجلسات
            <input className="input" type="file" onChange={this.handleFileChange} multiple />
          </label>
          <p>يرجى الضغط على:</p>
          <p>submit لتحميل الملفات</p>
          
          <button className="submit-btn" onClick={this.handleUpload} disabled={uploading}>
            Submit
          </button>
          {uploading && !allFilesUploaded && (
            <div className="upload-progress">
              <p className="upload-progress-text">
                Uploading...<br />
                Don't lock your device during the process <br />
                لا تقفل جهازك أثناء العملية <br />
                {progress.toFixed(2)}%
              </p>
              <progress className="progress-bar" max="100" value={progress}></progress>
            </div>
          )}
          {allFilesUploaded && (
            <div className="submission-success">
              Upload is done successfully! After checking all required inputs, kindly press Submit to submit the form
            </div>
          )}
          
          <footer>
            <p>© 2024 Mena THRC. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }
}

