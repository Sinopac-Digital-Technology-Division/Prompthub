(function () {
  function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  let data = window.sessionStorage.getItem("OAISessionStorage");
  try {
    const history = JSON.parse(data).chatGPTChatHistoryForAllResources;
    data = history[history.length - 1];
    download("messages.json", JSON.stringify(data, null, "  "));
  } catch (e) {
    alert("Error capturing messages, please refresh and try again.\n", e);
    return;
  }
})();
