
def crime_standardization(crime_group, city_name, crime_assoc_list):
    city_crime_group = {
        new_key: new_val
        for keys, new_val in crime_assoc_list
        for new_key in keys
    }
    crime_group[city_name] = city_crime_group


assoc_list1 = [ (["01A"], "murder"), (["02"], "sexual assault"), (["04A", "04B"], "aggravated assault"),
                (["03"], "robbery"), (["05"], "burglary"), (["06"], "theft"), (["07"], "motor vehicle theft") ]

assoc_list2 = [ (["11A", "11B", "11C"], "sexual assault"), (["09A"], "murder"), (["13A"], "aggravated assault"), (["220"], "burglary"),
                (["120"], "robbery"), (["23A", "23B", "23C", "23D", "23E", "23F", "23G", "23H"], "theft"), (["240"], "motor vehicle theft") ]

assoc_list3 = [ (["SEXUAL ABUSE 3,2", "SEXUAL ABUSE", "SODOMY 1", "RAPE 1", "RAPE 3", "RAPE 2"], "sexual assault"), (["MURDER,UNCLASSIFIED"], "murder"),
                (["ASSAULT 2,1,UNCLASSIFIED", "ASSAULT 3"], "aggravated assault"), (["BURGLARY,UNCLASSIFIED,UNKNOWN", "BURGLARY,RESIDENCE,NIGHT"], "burglary"),
                (["ROBBERY,OPEN AREA UNCLASSIFIED"], "robbery"), (["LARCENY,GRAND FROM PERSON,UNCL", "LARCENY,GRAND FROM OPEN AREAS, UNATTENDED", "LARCENY,PETIT FROM OPEN AREAS,"], "theft"),
                (["LARCENY,GRAND OF AUTO"], "motor vehicle theft") ]

crime_type_fields = {"Chicago" : "fbi_code",
                    "Austin" : "ucr_category",
                    "New York" : "pd_desc",
                    "Kansas City" : "ibrs"
                    }


