import wave
import struct

SAMPLE_LEN = 1323000

def splitNumber (num):
    lst = []
    while num > 0:
        lst.append(num & 0xFF)
        num >>= 8
    return lst[::-1]

noise_output = wave.open('noise_long.wav', 'w')
noise_output.setparams((2, 2, 44100, 0, 'NONE', 'not compressed'))

values = []

data = []
with open('./inputs_list', 'r') as f:
    for line in f:
        line = line.strip()
        if (len(line) > 0):
            data.append(int(line, 16))

b = []
for n in data:
    b += splitNumber(int(n))

for i in range(0, SAMPLE_LEN):
    value = b[i % len(b)]
    packed_value = struct.pack('h', value)
    values.append(packed_value)
    value = b[i % len(b)]
    packed_value = struct.pack('h', value)
    values.append(packed_value)

value_str = ''.join(values)
noise_output.writeframes(value_str)

noise_output.close()
