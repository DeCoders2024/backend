% perform arithmetic operations on two images

img_1=imread('C:\\tut\\img_1.jpg');

img_2=imread('C:\\tut\\img_2.png');

% Resize Images

img_1=imresize(img_1,[460,750]);

img_2=imresize(img_2,[460,750]);

% Addition Of Image

img_add=img_1+img_2;

subplot(2,3,1);
imshow(img_add);


% Subtraction Of Image

img_sub=abs(img_1-img_2);

subplot(2,3,2);
imshow(img_sub);

% Multiplication Of Image

img_mul=img_1.*img_2;

subplot(2,3,3);
imshow(img_mul);

% Division Of Image

img_div=img_1./img_2;

subplot(2,3,4);
imshow(img_div);

subplot(2,3,5);
imshow(img_1);

subplot(2,3,6);
imshow(img_2);

