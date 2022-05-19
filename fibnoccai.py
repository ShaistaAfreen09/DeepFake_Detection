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

