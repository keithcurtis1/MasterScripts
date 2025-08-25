tell application "Adobe InDesign 2022"
	--return selection
	set tableexport to ""
	
	set theTables to every table of every text frame of front document
	--return item 1 of theTables
	
	set theParent to parent of item 2 of theTables
	set bob to contents of row 2 of item 2 of theTables
	
	repeat with i from 2 to count of theTables
		
		set thistable to item i of theTables
		set tableexport to tableexport & return & return
		repeat with ii from 1 to count of rows of thistable
			set thisRow to contents of row ii of thistable
			--set columnSpan to column span of row ii of thistable
			
			set separatedRow to ""
			if class of thisRow is text then
				set separatedRow to separatedRow & thisRow
			else
				repeat with iii from 1 to count of thisRow
					set thisItem to item iii of thisRow
					set thisItem to my replace_chars(thisItem, "
", "")
					if iii is 1 then set thisItem to my separateRoll(thisItem)
					
					set separatedRow to separatedRow & thisItem & tab
				end repeat
			end if
			
			
			set tableexport to tableexport & separatedRow & return
		end repeat
	end repeat
	
end tell


on separateRoll(theString)
	set theCells to theString
	if (count of theString) > 1 then
		if character 1 of theString is in "1234567890" and " " is in theString then
			set AppleScript's text item delimiters to " "
			set theRoll to text item 1 of the theString
			set AppleScript's text item delimiters to ""
			set thePosition to (count of theRoll) + 2
			set theResult to characters thePosition thru -1 of theString as string
			set theCells to theRoll & tab & theResult
		end if
	end if
	return theCells
end separateRoll

on replace_chars(this_text, search_string, replacement_string)
	set AppleScript's text item delimiters to the search_string
	set the item_list to every text item of this_text
	set AppleScript's text item delimiters to the replacement_string
	set this_text to the item_list as string
	set AppleScript's text item delimiters to ""
	return this_text
end replace_chars