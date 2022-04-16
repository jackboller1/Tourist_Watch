crime_group = {"Chicago": 
                        {"01A" : "murder", "02" : "sexual assault", "04A" : "aggravated assault", "04B" : "aggravated assault",
                         "03" : "robbery", "05" : "burglary", "06" : "theft", "07" : "motor vehicle theft"}  
              }

austin_dict = {
    new_key: new_val
    for keys, new_val in [ (["11A", "11B", "11C"], "sexual assault"), (["09A"], "murder"), (["13A"], "aggravated assault"), (["220"], "burglary"),
                         (["120"], "robbery"), (["23A", "23B", "23C", "23D", "23E", "23F", "23G", "23H"], "theft"), (["240"], "motor vehicle theft") ]
    for new_key in keys
    }

crime_group["Austin"] = austin_dict

crime_type_fields = {"Chicago" : "fbi_code",
                    "Austin" : "ucr_category"
                    }