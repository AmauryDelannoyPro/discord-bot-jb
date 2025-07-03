function enableSpeechRecognition(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (typeof SpeechRecognition === "undefined") {
    document.querySelectorAll(".recording-button").forEach(button => button.remove());
    return;
  }

  // Initialize for each widget
  document.querySelectorAll(".transcript-widget").forEach(widget => {
    const recordingButton = widget.querySelector(".recording-button");
    const transcriptionResult = widget.querySelector(".transcription-result");

    let isRecording = false;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR"

    recognition.addEventListener("result", (event) => {
      transcriptionResult.value = ""; // Clear previous content
      for (const result of event.results) {
        transcriptionResult.value += result[0].transcript;
      }
    });

    recordingButton.addEventListener("click", () => {
      if (isRecording) {
        recognition.stop();
        recordingButton.textContent = "🎙️ Dicter";
      } else {
        recognition.start();
        recordingButton.textContent = "🛑 Fin de dictée";
      }
      isRecording = !isRecording;
    });
  });
}
