num = int(input("enter a number:"))
rev = 0
temp = num
while temp > 0:
    rem = temp % 10
    rev = rem + (rev * 10)
    temp = int(temp / 10)
if rev == num:
    print("It is a Palindrome Number")
else:
    print("It is not a Palindrome Number")
'''num = int(input("enter a number"))
if num > 1:
    for i in range(2,num):
        if num % i == 0:
            print("the number is not a prime number")
            print(i,"times",num//i,"is",num)
            break
    else:
        print(num,"the number is prime number.")'''
