def solve(arr,n):
    for i in range(n):
        ind=pow(arr[i],0.5)
        if(ind==int(ind)):
            arr[i]=1
        else:
            arr[i]=0

def countWays(n, m,k):
     
    dp = [0] * (n + 1)
    total = m
    mod = 1000000007
     
    dp[1] = m
    dp[2] = m * m   
    pre=dp[1]+dp[2]
    for i in range(3,n+1):
        dp[i] = ((m - 1) * (dp[i - 1] + dp[i -   2])) % mod
         
    return dp[n]
    