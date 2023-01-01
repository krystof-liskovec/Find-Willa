#!/bin/bash

dir=$(dirname -- "$(readlink -f "${BASH_SOURCE}")")
strategy=${1:-$(($RANDOM % 4))}
echo "Strategy: $strategy"

$dir/../build/find-willa -s $1 $dir

find $dir/find-willa-game -iname Willa
find $dir/find-willa-game -iname alliW
find $dir/find-willa-game ! -name ".willa-config" -exec grep -H -i "Willa" {} \; 2> /dev/null
find $dir/find-willa-game -perm 020

rm -rf $dir/find-willa-game