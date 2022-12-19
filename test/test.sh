#!/bin/bash

dir=$(dirname -- "$(readlink -f "${BASH_SOURCE}")")
strategy=${1:-$(($RANDOM % 4))}
echo "Strategy: $strategy"

$dir/../build/find-willa -s $1 $dir

find $dir/find-willa -iname Willa
find $dir/find-willa -iname alliW
find $dir/find-willa ! -name ".willa-config" -exec grep -H -i "Willa" {} \; 2> /dev/null
find $dir/find-willa -perm 020

rm -rf $dir/find-willa