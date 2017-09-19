def distance(points):
    return pow(points[0][0] - points[1][0],2) + pow(points[0][1] - points[1][1],2)

def norminize(x):
    s= sum(x)
    return [float(i) / s for i in x]

vertices = [[0,286],[285,500],[214,0]]
points = [[89,173], [112,184], [135,195]]
color = [0.4,1,0.6]

for p in points:
    d = [distance([p,v]) for v in vertices]
    w = norminize(d)
    print w
    print sum([color[i]*w[i] for i in range(3)])
