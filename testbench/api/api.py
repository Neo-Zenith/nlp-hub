# import requests
# import json

# url = "https://sud.speechlab.sg/lang_change"
# headers = {'Content-Type': 'application/json'}
# data = {'lang': 'EN'} # Replace 'en' with the language code you want to use

# response = requests.post(url, headers=headers, data=json.dumps(data))

# print(response.text)


import httplib2
import json
import httplib2
import json

lang = 'EN'
sud_update_lang_url = "https://sud.speechlab.sg/lang_change"
data = {"fav_language": lang, "punc_type": "all"}
header = {"Content-Type": "application/json"}
http = httplib2.Http()

print("Sending POST request to " + sud_update_lang_url + " with body data: " + json.dumps(data))
try:
    response, send = http.request(sud_update_lang_url, "POST", headers=header, body=json.dumps(data))
    print("Server response status: " + str(response.status))
    print("Server response content: " + send.decode('utf8').replace("'", '"'))
except:
    print("Failed to send POST request to " + sud_update_lang_url)