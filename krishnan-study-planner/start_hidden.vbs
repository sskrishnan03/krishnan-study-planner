Set WshShell = CreateObject("WScript.Shell")
' Start the server in a hidden window
WshShell.Run "cmd /c cd /d ""%~dp0"" && npm run dev", 0, False
' Wait for server to start
WScript.Sleep 3000
' Open the webpage
WshShell.Run "http://localhost:5173", 1, False
