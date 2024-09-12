

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
          await axios.post("/attachments.php", formData);
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
          <img className="logo" src="THRC.jpeg" alt="logo img" />
          <h1>File Upload Form</h1>
        </div>
        
        <div className="form">
         
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

