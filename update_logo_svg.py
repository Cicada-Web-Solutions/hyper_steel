with open('assets/logo_vector.svg', 'r') as f:
    c = f.read()

c_new = c.replace('fill="#000000"', 'fill="currentColor"')
with open('assets/logo_vector.svg', 'w') as f:
    f.write(c_new)

print('Updated assets/logo_vector.svg with fill=currentColor')
