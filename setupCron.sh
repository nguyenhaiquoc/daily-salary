# Add cronjob to run the script at 1 AM every day
(crontab -l ; echo "0 1 * * * $(which node) $(pwd)/dist/calculateDailySalaryScript.js") | crontab -
