dir=manifests
for entry in "$dir"/*
do
  npx sqd deploy . -m "$entry" -u --no-stream-logs -r
  echo "$entry deployed"
done