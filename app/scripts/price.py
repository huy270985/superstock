"""
This module add new price value for entity 'price'
"""
import requests as r

if __name__ == '__main__':
    token = 'PXYLKMKPU4WRH5A2LOLSYUD7NTLMASO6'
    url = 'https://api.wit.ai/entities/price?v=20170101'
    req = r.get('', headers={'Authorization': 'Bearer ' + token})
    print(req.content())
