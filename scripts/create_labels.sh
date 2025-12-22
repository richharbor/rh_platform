#!/usr/bin/env bash
set -euo pipefail

REPO="richharbor/rh_platform"

labels=(
  "backend|API & server work|#1D4ED8"
  "mobile|React Native / Expo app|#16A34A"
  "infra|Terraform, cloud, deployment|#7C3AED"
  "docker|Docker, compose, containers|#0EA5E9"
  "chore|Repo tooling, CI, maintenance|#64748B"
  "security|Auth, secrets, security work|#DC2626"
  "push|Push notifications|#F59E0B"
  "db|Database & migrations|#9333EA"
  "testing|Tests & QA|#22C55E"
  "docs|Documentation|#F97316"
)

create_label () {
  local name="$1" desc="$2" color="$3"
  if gh label list -R "$REPO" | awk '{print $1}' | grep -qx "$name"; then
    echo "Label exists: $name"
  else
    gh label create "$name" -R "$REPO" -d "$desc" -c "$color"
    echo "Created label: $name"
  fi
}

for item in "${labels[@]}"; do
  IFS="|" read -r name desc color <<< "$item"
  create_label "$name" "$desc" "$color"
done
