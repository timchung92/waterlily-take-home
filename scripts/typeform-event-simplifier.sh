
#
# replace these regex:
#
# \{\n +"type": "\w+",\n +"\w+": (.+),\n.+\n.+.+\n.+\n +"ref": (.+)\n +\}\n +\}
# \{\n +"type": "choice",\n.+\n.+\n +"label": (.+),\n.+\n.+\n.+\n.+\n.+\n +"ref": (.+)\n +\}\n +\}
# \{\n +"type": "choices",\n +"choices".+\n.+\n(?:[ "\w,\]]|\n)*"labels": (\[(?:[^\]]|\n)+\])(?:.|\n)+?"ref": (".+")\n +\}\n +\}
#
# with
#
# $2: $1
#
