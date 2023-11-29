jest --coverage=false
result=$?

[ $result != 0 ] && [[ -z $CI ]] && open ./coverage/lcov-report/index.html

exit $result
