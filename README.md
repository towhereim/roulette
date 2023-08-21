# Weighted roulette
가중치 룰렛입니다.
기본 기능 구현만 되어 있고, 추가 기능은 추후 구현 적용 예정입니다.

Change log
2023-02-14
 - 브라우저 local storage 사용
 - 사용자, 가중치 UI 및 엑셀 붙여넣기

next
 - 여러번 돌린 통계 표시

 style.scss
 `
 npx sass --watch style.scss style.css
 `

 (AzureDiagnostics 
| where     Category == "TunnelDiagnosticLog" 
| extend    localIp_s = case(instance_s contains "IN_0", "20.48.69.69", "20.48.69.151") 
| extend    remoteLocation = case(
            remoteIP_s in ("58.87.57.60"), "CCS-OnPrem (의왕)",
            remoteIP_s in ("20.89.112.80"), "Jplatform (Azure)",
            remoteIP_s in ("18.176.69.81", "54.64.159.54", "52.196.49.208", "54.178.69.123"), "MobilityPlatform-PRD (AWS)", 
            "MobilityPlatform-STG (AWS)")
| project   TimeGenerated, Resource, status_s, instance_s, localIp_s, remoteIP_s, remoteLocation, stateChangeReason_s 
| order by  TimeGenerated desc)
| union 
    (AzureDiagnostics
    | where     Category == "GatewayDiagnosticLog"
        and     OperationName in ("SetGatewayConfiguration", "HostMaintenanceEvent")
    | order by  TimeGenerated desc
    | project   TimeGenerated, Resource, OperationName, operationStatus_s, instance_s, Message)
| distinct  *
| order by  TimeGenerated desc