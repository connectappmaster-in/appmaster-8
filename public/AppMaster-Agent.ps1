# AppMaster Device Agent
# Single-file agent that installs itself as a Windows Service and runs continuously
# Run as Administrator to install, or it runs automatically as a service

# === CONFIGURATION ===
$API_ENDPOINT = "https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1/device-agent"
$API_KEY = "6q^:I`0Zt!)acO1LrD1%LLFam4FDWn"
$ORGANISATION_ID = "28374dab-a447-44e2-a65f-edc644553b31"
$HEARTBEAT_INTERVAL = 60  # seconds
$TASK_CHECK_INTERVAL = 30  # seconds
$AGENT_VERSION = "1.0.0"
$SERVICE_NAME = "AppMaster_Agent"
$DISPLAY_NAME = "AppMaster Device Agent"
$DESCRIPTION = "AppMaster device monitoring and management agent"

# === LOGGING ===
$LogPath = "C:\ProgramData\AppMaster\Logs"
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}
$LogFile = Join-Path $LogPath "agent-$(Get-Date -Format 'yyyy-MM-dd').log"

function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage
    Write-Host $logMessage
}

# === CHECK IF RUNNING AS SERVICE OR INTERACTIVE ===
$isInteractive = [Environment]::UserInteractive
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# If running interactively, handle installation
if ($isInteractive) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " AppMaster Device Agent Installer" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $isAdmin) {
        Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
        Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Check for uninstall parameter
    $uninstall = $args -contains "-Uninstall" -or $args -contains "-u"
    
    if ($uninstall) {
        Write-Host "Uninstalling AppMaster Agent..." -ForegroundColor Yellow
        
        $service = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
        if ($service) {
            if ($service.Status -eq 'Running') {
                Stop-Service -Name $SERVICE_NAME -Force
                Write-Host "  Service stopped" -ForegroundColor Green
            }
            & sc.exe delete $SERVICE_NAME | Out-Null
            Start-Sleep -Seconds 2
            Write-Host "  Service removed" -ForegroundColor Green
        } else {
            Write-Host "  Service not found" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Uninstallation complete!" -ForegroundColor Green
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 0
    }
    
    # Installation mode
    Write-Host "Installing AppMaster Agent as Windows Service..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create installation directory
    $installPath = "C:\ProgramData\AppMaster"
    if (-not (Test-Path $installPath)) {
        New-Item -ItemType Directory -Path $installPath -Force | Out-Null
        Write-Host "[1/4] Created directory: $installPath" -ForegroundColor Gray
    } else {
        Write-Host "[1/4] Directory exists: $installPath" -ForegroundColor Gray
    }
    
    # Copy this script to install location
    $scriptPath = $MyInvocation.MyCommand.Path
    $installedScript = Join-Path $installPath "AppMaster-Agent.ps1"
    Copy-Item -Path $scriptPath -Destination $installedScript -Force
    Write-Host "[2/4] Copied agent to: $installedScript" -ForegroundColor Gray
    
    # Remove existing service if present
    $existingService = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "[3/4] Removing existing service..." -ForegroundColor Gray
        if ($existingService.Status -eq 'Running') {
            Stop-Service -Name $SERVICE_NAME -Force
        }
        & sc.exe delete $SERVICE_NAME | Out-Null
        Start-Sleep -Seconds 2
    } else {
        Write-Host "[3/4] No existing service found" -ForegroundColor Gray
    }
    
    # Install as service
    Write-Host "[4/4] Installing service..." -ForegroundColor Gray
    
    $serviceBinary = "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$installedScript`""
    
    New-Service -Name $SERVICE_NAME `
        -BinaryPathName $serviceBinary `
        -DisplayName $DISPLAY_NAME `
        -Description $DESCRIPTION `
        -StartupType Automatic | Out-Null
    
    # Start the service
    Start-Service -Name $SERVICE_NAME
    Start-Sleep -Seconds 2
    
    $service = Get-Service -Name $SERVICE_NAME
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Installation Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Service Name: $SERVICE_NAME" -ForegroundColor White
    Write-Host "Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { "Green" } else { "Yellow" })
    Write-Host "Install Path: $installPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  Check status:  Get-Service -Name $SERVICE_NAME" -ForegroundColor Gray
    Write-Host "  View logs:     Get-Content $LogFile -Tail 50" -ForegroundColor Gray
    Write-Host "  Uninstall:     .\AppMaster-Agent.ps1 -Uninstall" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# === SERVICE MODE - AGENT FUNCTIONS ===

function Get-DeviceInfo {
    try {
        $computerInfo = Get-ComputerInfo
        return @{
            hostname = $env:COMPUTERNAME
            serial_number = (Get-CimInstance Win32_BIOS).SerialNumber
            os_version = $computerInfo.OSDisplayVersion
            os_build = $computerInfo.OSBuildNumber
            last_boot_time = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToString("yyyy-MM-ddTHH:mm:ss")
            ip_address = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress
        }
    }
    catch {
        Write-Log "Error collecting device info: $_" "ERROR"
        return $null
    }
}

function Get-PendingUpdates {
    try {
        $updateSession = New-Object -ComObject Microsoft.Update.Session
        $updateSearcher = $updateSession.CreateUpdateSearcher()
        $searchResult = $updateSearcher.Search("IsInstalled=0 and Type='Software'")
        
        $updates = @()
        foreach ($update in $searchResult.Updates) {
            $kbNumber = "Unknown"
            if ($update.KBArticleIDs.Count -gt 0) {
                $kbNumber = "KB" + $update.KBArticleIDs[0]
            }
            
            $severity = "Unknown"
            if ($update.MsrcSeverity) {
                $severity = $update.MsrcSeverity
            }
            
            $updates += @{
                kb_number = $kbNumber
                title = $update.Title
                severity = $severity
                size_mb = [math]::Round($update.MaxDownloadSize / 1MB, 2)
            }
        }
        return $updates
    }
    catch {
        Write-Log "Error getting pending updates: $_" "WARN"
        return @()
    }
}

function Get-InstalledUpdates {
    try {
        $updates = @()
        $hotfixes = Get-HotFix | Select-Object -First 50 | Sort-Object InstalledOn -Descending
        
        foreach ($hotfix in $hotfixes) {
            if ($hotfix.HotFixID -and $hotfix.InstalledOn) {
                $updates += @{
                    kb_number = $hotfix.HotFixID
                    title = $hotfix.Description
                    installed_date = $hotfix.InstalledOn.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            }
        }
        return $updates
    }
    catch {
        Write-Log "Error getting installed updates: $_" "WARN"
        return @()
    }
}

function Get-FailedUpdates {
    try {
        $updates = @()
        $events = Get-WinEvent -FilterHashtable @{
            LogName = 'System'
            ProviderName = 'Microsoft-Windows-WindowsUpdateClient'
            ID = 20
        } -MaxEvents 10 -ErrorAction SilentlyContinue
        
        foreach ($event in $events) {
            if ($event.Message -match 'KB(\d+)') {
                $kbNumber = "KB" + $Matches[1]
                $updates += @{
                    kb_number = $kbNumber
                    title = "Failed update"
                    error_code = $event.Id.ToString()
                }
            }
        }
        return $updates
    }
    catch {
        Write-Log "Error getting failed updates: $_" "WARN"
        return @()
    }
}

function Send-Heartbeat {
    param($DeviceInfo, $DeviceId = $null)
    
    try {
        $payload = @{
            type = "heartbeat"
            device_id = $DeviceId
            agent_version = $AGENT_VERSION
            organisation_id = $ORGANISATION_ID
            device_info = $DeviceInfo
        } | ConvertTo-Json -Depth 10
        
        $headers = @{
            "Authorization" = "Bearer $API_KEY"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Headers $headers -Body $payload -TimeoutSec 30
        Write-Log "Heartbeat sent. Device ID: $($response.device_id)" "INFO"
        return $response.device_id
    }
    catch {
        Write-Log "Failed to send heartbeat: $_" "ERROR"
        return $null
    }
}

function Send-UpdateData {
    param($DeviceInfo, $DeviceId, $PendingUpdates, $InstalledUpdates, $FailedUpdates)
    
    try {
        $payload = @{
            type = "update_data"
            device_id = $DeviceId
            hostname = $DeviceInfo.hostname
            serial_number = $DeviceInfo.serial_number
            os_version = $DeviceInfo.os_version
            os_build = $DeviceInfo.os_build
            last_boot_time = $DeviceInfo.last_boot_time
            ip_address = $DeviceInfo.ip_address
            organisation_id = $ORGANISATION_ID
            pending_updates = $PendingUpdates
            installed_updates = $InstalledUpdates
            failed_updates = $FailedUpdates
        } | ConvertTo-Json -Depth 10
        
        $headers = @{
            "Authorization" = "Bearer $API_KEY"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Headers $headers -Body $payload -TimeoutSec 30
        Write-Log "Update data sent. Compliance: $($response.compliance_status)" "INFO"
        return $response
    }
    catch {
        Write-Log "Failed to send update data: $_" "ERROR"
        return $null
    }
}

function Get-PendingTasks {
    param($DeviceId)
    
    try {
        $payload = @{
            type = "get_tasks"
            device_id = $DeviceId
            organisation_id = $ORGANISATION_ID
        } | ConvertTo-Json -Depth 10
        
        $headers = @{
            "Authorization" = "Bearer $API_KEY"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Headers $headers -Body $payload -TimeoutSec 30
        return $response.tasks
    }
    catch {
        Write-Log "Failed to get tasks: $_" "ERROR"
        return @()
    }
}

function Send-TaskResult {
    param($TaskId, $Status, $Result, $ErrorMessage = $null)
    
    try {
        $payload = @{
            type = "task_result"
            task_id = $TaskId
            status = $Status
            result = $Result
            error_message = $ErrorMessage
        } | ConvertTo-Json -Depth 10
        
        $headers = @{
            "Authorization" = "Bearer $API_KEY"
            "Content-Type" = "application/json"
        }
        
        Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Headers $headers -Body $payload -TimeoutSec 30
        Write-Log "Task result sent for $TaskId" "INFO"
    }
    catch {
        Write-Log "Failed to send task result: $_" "ERROR"
    }
}

function Execute-Task {
    param($Task)
    
    Write-Log "Executing task: $($Task.task_type) (ID: $($Task.id))" "INFO"
    
    try {
        switch ($Task.task_type) {
            "restart" {
                Send-TaskResult -TaskId $Task.id -Status "completed" -Result @{ message = "Restart initiated" }
                Start-Sleep -Seconds 5
                Restart-Computer -Force
            }
            "install_update" {
                $kbNumber = $Task.task_payload.kb_number
                Write-Log "Installing update: $kbNumber" "INFO"
                
                $updateSession = New-Object -ComObject Microsoft.Update.Session
                $updateSearcher = $updateSession.CreateUpdateSearcher()
                $searchResult = $updateSearcher.Search("IsInstalled=0")
                
                $updateToInstall = $searchResult.Updates | Where-Object { $_.KBArticleIDs -contains $kbNumber.Replace("KB", "") }
                
                if ($updateToInstall) {
                    $updatesToInstall = New-Object -ComObject Microsoft.Update.UpdateColl
                    $updatesToInstall.Add($updateToInstall) | Out-Null
                    
                    $installer = $updateSession.CreateUpdateInstaller()
                    $installer.Updates = $updatesToInstall
                    $installResult = $installer.Install()
                    
                    Send-TaskResult -TaskId $Task.id -Status "completed" -Result @{ 
                        kb_number = $kbNumber
                        result_code = $installResult.ResultCode
                        reboot_required = $installResult.RebootRequired
                    }
                }
                else {
                    Send-TaskResult -TaskId $Task.id -Status "failed" -Result @{} -ErrorMessage "Update not found"
                }
            }
            "run_script" {
                $script = $Task.task_payload.script
                $output = Invoke-Expression $script 2>&1 | Out-String
                Send-TaskResult -TaskId $Task.id -Status "completed" -Result @{ output = $output }
            }
            "collect_logs" {
                $logs = Get-EventLog -LogName System -Newest 100 | Select-Object TimeGenerated, EntryType, Source, Message
                Send-TaskResult -TaskId $Task.id -Status "completed" -Result @{ logs = $logs }
            }
            default {
                Send-TaskResult -TaskId $Task.id -Status "failed" -Result @{} -ErrorMessage "Unknown task type"
            }
        }
    }
    catch {
        Write-Log "Task failed: $_" "ERROR"
        Send-TaskResult -TaskId $Task.id -Status "failed" -Result @{} -ErrorMessage $_.ToString()
    }
}

# === MAIN SERVICE LOOP ===
Write-Log "========================================" "INFO"
Write-Log "AppMaster Agent Started (v$AGENT_VERSION)" "INFO"
Write-Log "========================================" "INFO"

$deviceId = $null
$lastHeartbeat = [DateTime]::MinValue
$lastUpdateScan = [DateTime]::MinValue
$lastTaskCheck = [DateTime]::MinValue

while ($true) {
    try {
        $now = Get-Date
        $deviceInfo = Get-DeviceInfo
        
        if ($null -eq $deviceInfo) {
            Start-Sleep -Seconds 30
            continue
        }
        
        # Heartbeat every minute
        if (($now - $lastHeartbeat).TotalSeconds -ge $HEARTBEAT_INTERVAL) {
            $deviceId = Send-Heartbeat -DeviceInfo $deviceInfo -DeviceId $deviceId
            $lastHeartbeat = $now
        }
        
        # Full update scan every 5 minutes
        if (($now - $lastUpdateScan).TotalSeconds -ge 300) {
            if ($null -ne $deviceId) {
                Write-Log "Scanning updates..." "INFO"
                Send-UpdateData -DeviceInfo $deviceInfo -DeviceId $deviceId `
                    -PendingUpdates (Get-PendingUpdates) `
                    -InstalledUpdates (Get-InstalledUpdates) `
                    -FailedUpdates (Get-FailedUpdates)
                $lastUpdateScan = $now
            }
        }
        
        # Check tasks every 30 seconds
        if (($now - $lastTaskCheck).TotalSeconds -ge $TASK_CHECK_INTERVAL) {
            if ($null -ne $deviceId) {
                $tasks = Get-PendingTasks -DeviceId $deviceId
                if ($tasks -and $tasks.Count -gt 0) {
                    Write-Log "Found $($tasks.Count) task(s)" "INFO"
                    foreach ($task in $tasks) {
                        Execute-Task -Task $task
                    }
                }
                $lastTaskCheck = $now
            }
        }
        
        Start-Sleep -Seconds 10
    }
    catch {
        Write-Log "Service error: $_" "ERROR"
        Start-Sleep -Seconds 30
    }
}
