import React, { useState } from 'react';
import  "./LoanForm.css";

const LoanForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      console.error("Aucun fichier sélectionné.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("loanApplication", selectedFile);
  
      const response = await fetch("http://localhost:3001/loan", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du fichier.");
      }
  
      console.log("Le fichier a été envoyé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'envoi du fichier :", error);
    }
  };
  return (
    <div className="registration-form">
      <form onSubmit={handleSubmit}>
        <h4>Upload Loan Application Document</h4>
        <div className="form-group">
          <input
            type="file"
            onChange={handleFileChange}
            className="form-control item"
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-block create-account">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;
