@echo off
setlocal

set "NOME_DO_PROJETO=360-viewer"
set "PASTA_CODIGO=Code"
set "PASTA_BUILD=Build"
set "ARQUIVO_EXE_FINAL=%NOME_DO_PROJETO%.exe"

echo ==========================================
echo      BUILDING - %NOME_DO_PROJETO%
echo ==========================================
echo.

echo [1/5] Verifying Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js before continuing.
    echo Download at: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js detectado.
echo.

echo [2/5] Installing dependencies (npm install)...
if not exist "%~dp0%PASTA_CODIGO%" (
    echo [ERRO] The folder "%PASTA_CODIGO%" was not found!
    pause
    exit /b 1
)

cd /d "%~dp0%PASTA_CODIGO%"
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Fail to load dependencies.
    pause
    exit /b 1
)
echo Dependencies installed.
echo.

echo [3/5] Generating the executable (npm run build:portable)...
call npm run build:portable
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)
echo Build completed successfully.
echo.

echo [4/5] Organizing files...
cd /d "%~dp0"

if not exist "%PASTA_BUILD%" mkdir "%PASTA_BUILD%"

del /Q "%PASTA_BUILD%\*.exe" 2>nul

move /Y "%PASTA_CODIGO%\release\*.exe" "%PASTA_BUILD%\" >nul

if %errorlevel% neq 0 (
    echo [WARNING] Failed to move the executable automatically.
    echo Check the folder "%PASTA_CODIGO%\release".
) else (
    echo File moved to the folder "%PASTA_BUILD%".
)
echo.

echo [5/5] Creating shortcut in root...

for %%f in ("%PASTA_BUILD%\*.exe") do set "CAMINHO_EXE_COMPLETO=%%f"

set "SCRIPT_ATALHO=%temp%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SCRIPT_ATALHO%"
echo sLinkFile = "%~dp0%NOME_DO_PROJETO%.lnk" >> "%SCRIPT_ATALHO%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SCRIPT_ATALHO%"
echo oLink.TargetPath = "%CAMINHO_EXE_COMPLETO%" >> "%SCRIPT_ATALHO%"
echo oLink.WorkingDirectory = "%~dp0%PASTA_BUILD%" >> "%SCRIPT_ATALHO%"
echo oLink.Description = "Run %NOME_DO_PROJETO%" >> "%SCRIPT_ATALHO%"
echo oLink.IconLocation = "%CAMINHO_EXE_COMPLETO%, 0" >> "%SCRIPT_ATALHO%"
echo oLink.Save >> "%SCRIPT_ATALHO%"

cscript /nologo "%SCRIPT_ATALHO%"
del "%SCRIPT_ATALHO%"

echo.
echo ==========================================
echo                 SUCCESS!.
echo ==========================================
echo Open the folder "Build".
echo A shortcut has been created in this folder for convenience.
echo.
pause