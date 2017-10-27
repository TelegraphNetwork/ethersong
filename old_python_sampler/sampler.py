import requests
import json
import re

start_height = 4243133
k = 10000
hashes = []
inputs = []
# for i in range(start_height, start_height + k):
#     if (i - start_height) % 100 == 0:
#         print (i - start_height)
#     params = {
#         'module': 'proxy',
#         'action': 'eth_getBlockByNumber',
#         'tag': hex(i),
#         'boolean': 'true',
#         'apikey': ''
#     }
#     r = requests.get('https://api.etherscan.io/api', params=params)
#     json = r.json()
#     with open('blocks/' + str(i) + '.json', 'w') as f:
#         f.write(str(json))
#     hashes += [tx['hash'] for tx in json['result']['transactions']]
#     inputs += [tx['input'] for tx in json['result']['transactions'] if tx['input'] != '0x']
regex = re.compile(r"(\W)u'")
for i in range(4243133, 4243908):
    with open('./blocks/' + str(i) + '.json', 'r') as f:
        lns = ''.join([regex.sub(r"\1'", l) for l in f.readlines()])
        lns = lns.replace("'", '"')
        lns = lns.replace(': None', ': ""')
        data = json.loads(lns)
        hashes += [tx['hash'] for tx in data['result']['transactions']]
        inputs += [tx['input'] for tx in data['result']['transactions'] if tx['input'] != '0x']

with open('txs_list', 'w') as f:
    f.write('\n'.join(hashes))
with open('inputs_list', 'w') as f:
    f.write('\n'.join(inputs))
