pragma solidity ^0.8.0;

contract BVideo{
    
    string public name = 'Bvideo';
    uint public vCount = 0;

    struct Video{
        uint id;
        string videoHash;
        string title;
        address author;
    }

    mapping(uint => Video) public videos;

    event videoUploadedEvent(uint id, string vhash, string title, address uploader);

    constructor(){

    }

    function videoUpload(string memory _hash, string memory _title) public{
        require(bytes(_hash).length > 0, 'Video Hash is not received');

        videos[vCount] = Video(vCount, _hash, _title, msg.sender );
        vCount++;

        emit videoUploadedEvent(vCount, _hash, _title, msg.sender);
    }
}